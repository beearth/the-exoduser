extends SceneTree
## Source-only offline 2D conversion. Run with isolated override, --headless --script.
## Original PNGs remain byte-identical. No resizing/mipmaps/new art; exportable Image resources.
func _initialize() -> void:
 if not "Isolated" in OS.get_user_data_dir():quit(2);return
 var bc7: bool="--bc7" in OS.get_cmdline_user_args()
 var target: String="res://assets/map/web_parity/"+("chunks_gpu_bc7" if bc7 else "chunks_gpu")
 DirAccess.make_dir_recursive_absolute(target)
 var bytes: int=0
 for y in range(8):
  for x in range(8):
   for layer in range(3):
    var source: String="res://assets/map/web_parity/"+(["chunks1440/chunk_%d_%d.png","sway_%d_%d.png","edge_%d_%d.png"][layer]%[x,y])
    if not FileAccess.file_exists(source):continue
    var tex: Texture2D=load(source)
    var image: Image=tex.get_image();image.convert(Image.FORMAT_RGBA8)
    var err: int=image.compress_from_channels(Image.COMPRESS_BPTC if bc7 else Image.COMPRESS_S3TC,Image.USED_CHANNELS_RGBA)
    if err!=OK:push_error(source);quit(1);return
    bytes+=image.get_data_size()
    var dest: String=target.path_join("%d_%d_%d.res"%[x,y,layer])
    if ResourceSaver.save(image,dest)!=OK:quit(1);return
   print("CHUNK_IMAGE ",x,",",y)
 var blank:=Image.create(1024,1024,false,Image.FORMAT_RGBA8)
 blank.compress_from_channels(Image.COMPRESS_BPTC if bc7 else Image.COMPRESS_S3TC,Image.USED_CHANNELS_RGBA)
 ResourceSaver.save(blank,target.path_join("blank_sway.res"))
 print("CHUNK_IMAGE_BYTES ",bytes);quit()
