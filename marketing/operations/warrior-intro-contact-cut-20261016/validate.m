#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <AppKit/AppKit.h>
int main(){@autoreleasepool{
 NSString *base=@"/Users/fordeargamers/the-exoduser/output/warrior-intro-contact-cut-20261016";NSString *qa=[base stringByAppendingPathComponent:@"QA"];
 AVURLAsset *a=[AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:[base stringByAppendingPathComponent:@"REVIEW/EXODUSER_WARRIOR_INTRO_CONTACT_CUT_V1_20261016_REVIEW.mp4"]] options:nil];
 AVURLAsset *source=[AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:@"/Users/fordeargamers/the-exoduser/output/warrior-intro-latest-20261011/REVIEW/EXODUSER_WARRIOR_INTRO_20261008_REVIEW.mp4"] options:nil];
 NSError *err=nil;AVAssetTrack *t=[a tracksWithMediaType:AVMediaTypeVideo].firstObject;AVAssetReader *r=[[AVAssetReader alloc]initWithAsset:a error:&err];AVAssetReaderTrackOutput *o=[[AVAssetReaderTrackOutput alloc]initWithTrack:t outputSettings:@{(id)kCVPixelBufferPixelFormatTypeKey:@(kCVPixelFormatType_420YpCbCr8BiPlanarVideoRange)}];o.alwaysCopiesSampleData=NO;[r addOutput:o];if(![r startReading])return 1;NSUInteger count=0;CMSampleBufferRef s;double last=-1;BOOL monotonic=YES;
 while((s=[o copyNextSampleBuffer])){double ts=CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(s));if(ts<=last)monotonic=NO;last=ts;count++;CFRelease(s);}
 if(r.status!=AVAssetReaderStatusCompleted)return 2;
 AVAssetImageGenerator *g=[AVAssetImageGenerator assetImageGeneratorWithAsset:a],*sg=[AVAssetImageGenerator assetImageGeneratorWithAsset:source];for(AVAssetImageGenerator *x in @[g,sg]){x.appliesPreferredTrackTransform=YES;x.maximumSize=CGSizeMake(960,540);x.requestedTimeToleranceBefore=kCMTimeZero;x.requestedTimeToleranceAfter=kCMTimeZero;}
 NSMutableArray *frames=[NSMutableArray array];for(NSNumber *n in @[@80.9833333333,@81,@82,@83.5,@86,@87.4833333333,@87.5,@88]){double sec=n.doubleValue,expected=sec;if(sec>=81&&sec<87.5)expected=84+(sec-81)*3.5/6.5;
 CMTime at,st;CGImageRef im=[g copyCGImageAtTime:CMTimeMakeWithSeconds(sec,60000) actualTime:&at error:&err],sim=[sg copyCGImageAtTime:CMTimeMakeWithSeconds(expected,60000) actualTime:&st error:&err];if(!im||!sim)return 3;
 NSString *f=[qa stringByAppendingPathComponent:[NSString stringWithFormat:@"edited-%.4f.png",sec]],*sf=[qa stringByAppendingPathComponent:[NSString stringWithFormat:@"expected-%.4f.png",sec]];
 for(NSDictionary *z in @[@{@"im":[NSValue valueWithPointer:im],@"p":f},@{@"im":[NSValue valueWithPointer:sim],@"p":sf}]){NSBitmapImageRep *rep=[[NSBitmapImageRep alloc]initWithCGImage:(CGImageRef)[z[@"im"] pointerValue]];[[rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}]writeToFile:z[@"p"] atomically:YES];}
 [frames addObject:@{@"outputTime":n,@"actualOutputTime":@(CMTimeGetSeconds(at)),@"expectedSourceTime":@(expected),@"actualSourceTime":@(CMTimeGetSeconds(st)),@"outputFrame":f,@"expectedFrame":sf}];CGImageRelease(im);CGImageRelease(sim);}
 NSDictionary *receipt=@{@"duration":@(CMTimeGetSeconds(a.duration)),@"width":@(t.naturalSize.width),@"height":@(t.naturalSize.height),@"nominalFPS":@(t.nominalFrameRate),@"fullVideoDecodedFrames":@(count),@"monotonicPresentationTimestamps":@(monotonic),@"lastFrameTime":@(last),@"readerStatus":@"COMPLETED",@"frames":frames,@"fullSubjectiveWatch":@"NOT_PERFORMED",@"actualListening":@"UNHEARD"};
 NSData *j=[NSJSONSerialization dataWithJSONObject:receipt options:NSJSONWritingPrettyPrinted error:NULL];[j writeToFile:[qa stringByAppendingPathComponent:@"technical-qa.json"] atomically:YES];printf("Decoded %lu frames, %.3fs, %.0fx%.0f @ %.1ffps, monotonic=%d; saved %lu boundary mapping samples\n",(unsigned long)count,CMTimeGetSeconds(a.duration),t.naturalSize.width,t.naturalSize.height,t.nominalFrameRate,monotonic,(unsigned long)frames.count);return 0;
}}
