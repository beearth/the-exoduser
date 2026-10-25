import AppKit
import CoreText
import ImageIO
import UniformTypeIdentifiers

struct Failure: Error, CustomStringConvertible {
    let description: String
}

func require(_ condition: @autoclosure () -> Bool, _ message: String) throws {
    if !condition() { throw Failure(description: message) }
}

func loadImage(_ url: URL) throws -> CGImage {
    guard let source = CGImageSourceCreateWithURL(url as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        throw Failure(description: "Could not decode \(url.path)")
    }
    return image
}

func makeContext(width: Int, height: Int) throws -> CGContext {
    guard let context = CGContext(data: nil, width: width, height: height, bitsPerComponent: 8,
                                  bytesPerRow: width * 4,
                                  space: CGColorSpaceCreateDeviceRGB(),
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue |
                                    CGBitmapInfo.byteOrder32Big.rawValue) else {
        throw Failure(description: "Could not allocate \(width)x\(height) RGBA context")
    }
    context.clear(CGRect(x: 0, y: 0, width: width, height: height))
    return context
}

func exportPNG(_ image: CGImage, to url: URL) throws {
    try FileManager.default.createDirectory(at: url.deletingLastPathComponent(),
                                            withIntermediateDirectories: true)
    guard let destination = CGImageDestinationCreateWithURL(url as CFURL, UTType.png.identifier as CFString, 1, nil) else {
        throw Failure(description: "Could not create PNG at \(url.path)")
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else { throw Failure(description: "Could not write \(url.path)") }
}

func circularImage(_ image: CGImage, size: Int, grayscaleBrightness: CGFloat = 1) throws -> CGImage {
    let context = try makeContext(width: size, height: size)
    context.interpolationQuality = .high
    context.draw(image, in: CGRect(x: 0, y: 0, width: size, height: size))
    guard let data = context.data?.assumingMemoryBound(to: UInt8.self) else {
        throw Failure(description: "No pixel storage for masked image")
    }
    let center = (CGFloat(size) - 1) * 0.5
    let radius = center
    for y in 0..<size {
        for x in 0..<size {
            let i = (y * size + x) * 4
            let distance = hypot(CGFloat(x) - center, CGFloat(y) - center)
            let coverage = min(1, max(0, radius + 0.5 - distance))
            let alpha = CGFloat(data[i + 3]) / 255 * coverage
            if grayscaleBrightness < 1 {
                let luminance = (0.2126 * CGFloat(data[i]) + 0.7152 * CGFloat(data[i + 1]) + 0.0722 * CGFloat(data[i + 2]))
                let gray = UInt8(min(255, max(0, luminance * grayscaleBrightness)))
                data[i] = gray; data[i + 1] = gray; data[i + 2] = gray
            }
            data[i + 3] = UInt8(min(255, max(0, alpha * 255)))
        }
    }
    guard let output = context.makeImage() else { throw Failure(description: "Could not create masked image") }
    return output
}

func rasterizeGlyph(_ text: String, cell: Int, font: CTFont) throws -> CGImage {
    let context = try makeContext(width: cell, height: cell)
    let attributed = NSAttributedString(string: text, attributes: [.font: font])
    let line = CTLineCreateWithAttributedString(attributed)
    var ascent: CGFloat = 0, descent: CGFloat = 0, leading: CGFloat = 0
    let width = CGFloat(CTLineGetTypographicBounds(line, &ascent, &descent, &leading))
    let x = (CGFloat(cell) - width) * 0.5
    let baseline = (CGFloat(cell) - (ascent + descent)) * 0.5 + descent
    context.textMatrix = .identity
    context.textPosition = CGPoint(x: x, y: baseline)
    CTLineDraw(line, context)
    guard let image = context.makeImage() else { throw Failure(description: "Could not rasterize \(text)") }
    return image
}


func cssTraitFilter(_ image: CGImage) throws -> CGImage {
    let context = try makeContext(width: image.width, height: image.height)
    context.draw(image, in: CGRect(x: 0, y: 0, width: image.width, height: image.height))
    guard let data = context.data?.assumingMemoryBound(to: UInt8.self) else {
        throw Failure(description: "No pixel storage for CSS trait filter")
    }
    let angle = -6.0 * Double.pi / 180.0, cosine = cos(angle), sine = sin(angle)
    let hue = ([
        [0.213 + cosine * 0.787 - sine * 0.213, 0.715 - cosine * 0.715 - sine * 0.715, 0.072 - cosine * 0.072 + sine * 0.928],
        [0.213 - cosine * 0.213 + sine * 0.143, 0.715 + cosine * 0.285 + sine * 0.140, 0.072 - cosine * 0.072 - sine * 0.283],
        [0.213 - cosine * 0.213 - sine * 0.787, 0.715 - cosine * 0.715 + sine * 0.715, 0.072 + cosine * 0.928 + sine * 0.072]
    ])
    for pixel in 0..<(image.width * image.height) {
        let i = pixel * 4, alpha = Double(data[i + 3]) / 255.0
        if alpha <= 0 { continue }
        var r = min(1, Double(data[i]) / 255.0 / alpha)
        var g = min(1, Double(data[i + 1]) / 255.0 / alpha)
        var b = min(1, Double(data[i + 2]) / 255.0 / alpha)
        // CSS order: grayscale(.85), sepia(.85), saturate(1.12), brightness(.96), hue-rotate(-6deg).
        let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
        r = r * 0.15 + gray * 0.85; g = g * 0.15 + gray * 0.85; b = b * 0.15 + gray * 0.85
        let sr = r * 0.393 + g * 0.769 + b * 0.189
        let sg = r * 0.349 + g * 0.686 + b * 0.168
        let sb = r * 0.272 + g * 0.534 + b * 0.131
        r = r * 0.15 + sr * 0.85; g = g * 0.15 + sg * 0.85; b = b * 0.15 + sb * 0.85
        let lumR = 0.213 * r + 0.715 * g + 0.072 * b
        let lumG = lumR, lumB = lumR
        r = (lumR + (r - lumR) * 1.12) * 0.96
        g = (lumG + (g - lumG) * 1.12) * 0.96
        b = (lumB + (b - lumB) * 1.12) * 0.96
        let oldR = r, oldG = g, oldB = b
        r = hue[0][0] * oldR + hue[0][1] * oldG + hue[0][2] * oldB
        g = hue[1][0] * oldR + hue[1][1] * oldG + hue[1][2] * oldB
        b = hue[2][0] * oldR + hue[2][1] * oldG + hue[2][2] * oldB
        data[i] = UInt8(min(255, max(0, r * alpha * 255)))
        data[i + 1] = UInt8(min(255, max(0, g * alpha * 255)))
        data[i + 2] = UInt8(min(255, max(0, b * alpha * 255)))
    }
    guard let output = context.makeImage() else { throw Failure(description: "Could not create filtered glyph atlas") }
    return output
}

func run() throws {
    let args = CommandLine.arguments
    try require(args.count == 3, "Usage: swift export-character-presentation-assets.swift <character-select-art-dir> <blackiron-sigil.png>")
    let artRoot = URL(fileURLWithPath: args[1], isDirectory: true)
    let sigil = URL(fileURLWithPath: args[2])
    let output = artRoot.appendingPathComponent("generated", isDirectory: true)
    let cell = 256
    let names = ["warrior", "silvertail", "hellgunner", "transmuter", "spearmage"]
    let ringAtlas = try makeContext(width: cell * 5, height: cell * 2)
    for (index, name) in names.enumerated() {
        let input = artRoot.appendingPathComponent("emblem_\(name).png")
        let source = try loadImage(input)
        let selected = try circularImage(source, size: cell)
        let locked = try circularImage(source, size: cell, grayscaleBrightness: 0.35)
        ringAtlas.draw(selected, in: CGRect(x: index * cell, y: cell, width: cell, height: cell))
        ringAtlas.draw(locked, in: CGRect(x: index * cell, y: 0, width: cell, height: cell))
    }
    guard let ringImage = ringAtlas.makeImage() else { throw Failure(description: "Could not create ring atlas") }
    try exportPNG(ringImage, to: output.appendingPathComponent("presentation_ring_atlas.png"))

    let chainSource = try loadImage(artRoot.appendingPathComponent("coming_soon_chains_v2.png"))
    try exportPNG(try circularImage(chainSource, size: cell), to: output.appendingPathComponent("presentation_ring_chains.png"))

    let glyphs = ["⚔", "🛡", "💥", "🌀", "🗡", "✨", "🩸", "🎯", "💨", "🌙", "👻", "🌀", "🔮", "✴", "🌌", "✦"]
    let glyphCell = 128
    let glyphFont = CTFontCreateWithName("AppleColorEmoji" as CFString, 92, nil)
    let glyphAtlas = try makeContext(width: glyphCell * 5, height: glyphCell * 4)
    for (index, glyph) in glyphs.enumerated() {
        let image = try rasterizeGlyph(glyph, cell: glyphCell, font: glyphFont)
        let column = index % 5, row = index / 5
        glyphAtlas.draw(image, in: CGRect(x: column * glyphCell, y: (3 - row) * glyphCell,
                                          width: glyphCell, height: glyphCell))
    }
    guard let glyphImage = glyphAtlas.makeImage() else { throw Failure(description: "Could not create glyph atlas") }
    try exportPNG(try cssTraitFilter(glyphImage), to: output.appendingPathComponent("trait_glyphs.png"))

    let sigilOutput = output.appendingPathComponent("blackiron_sigil.png")
    if FileManager.default.fileExists(atPath: sigilOutput.path) {
        let existing = try Data(contentsOf: sigilOutput), source = try Data(contentsOf: sigil)
        try require(existing == source, "Existing sigil differs from pinned source")
    } else {
        try FileManager.default.copyItem(at: sigil, to: sigilOutput)
    }
    print("Wrote ring atlas, clipped chains, original Unicode trait glyph atlas, and byte-identical sigil to \(output.path)")
}

do { try run() }
catch { fputs("asset export failed: \(error)\n", stderr); exit(2) }
