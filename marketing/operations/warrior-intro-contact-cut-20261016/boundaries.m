#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <AppKit/AppKit.h>
int main(){@autoreleasepool{
 NSString *src=@"/Users/fordeargamers/the-exoduser/output/warrior-intro-latest-20261011/REVIEW/EXODUSER_WARRIOR_INTRO_20261008_REVIEW.mp4";
 NSString *out=@"/Users/fordeargamers/the-exoduser/output/warrior-intro-contact-cut-20261016/QA";
 [[NSFileManager defaultManager] createDirectoryAtPath:out withIntermediateDirectories:YES attributes:nil error:NULL];
 AVURLAsset *a=[AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:src] options:nil];NSError *err=nil;
 AVAssetReader *r=[[AVAssetReader alloc] initWithAsset:a error:&err]; AVAssetTrack *t=[a tracksWithMediaType:AVMediaTypeVideo].firstObject;
 AVAssetReaderTrackOutput *o=[[AVAssetReaderTrackOutput alloc]initWithTrack:t outputSettings:@{(id)kCVPixelBufferPixelFormatTypeKey:@(kCVPixelFormatType_32BGRA)}];
 o.alwaysCopiesSampleData=NO;[r addOutput:o];r.timeRange=CMTimeRangeFromTimeToTime(CMTimeMakeWithSeconds(78,600),CMTimeMakeWithSeconds(89,600));[r startReading];
 NSMutableArray *diffs=[NSMutableArray array]; unsigned char prior[24000];size_t priorN=0;
 CMSampleBufferRef s;while((s=[o copyNextSampleBuffer])){CVPixelBufferRef b=CMSampleBufferGetImageBuffer(s);CVPixelBufferLockBaseAddress(b,kCVPixelBufferLock_ReadOnly);unsigned char *p=CVPixelBufferGetBaseAddress(b);size_t w=CVPixelBufferGetWidth(b),h=CVPixelBufferGetHeight(b),stride=CVPixelBufferGetBytesPerRow(b),n=0;double sum=0;
 for(size_t y=24;y<h;y+=32)for(size_t x=16;x<w;x+=32)for(int c=0;c<3;c++){unsigned char v=p[y*stride+x*4+c];if(priorN)sum+=abs((int)v-(int)prior[n]);prior[n++]=v;}
 if(priorN)[diffs addObject:@{@"time":@(CMTimeGetSeconds(CMSampleBufferGetPresentationTimeStamp(s))),@"meanAbsRGB":@(sum/n)}];priorN=n;CVPixelBufferUnlockBaseAddress(b,kCVPixelBufferLock_ReadOnly);CFRelease(s);}
 if(r.status!=AVAssetReaderStatusCompleted){fprintf(stderr,"reader failed %s\n",r.error.description.UTF8String);return 1;}
 NSArray *rank=[diffs sortedArrayUsingComparator:^NSComparisonResult(NSDictionary *x,NSDictionary *y){return [y[@"meanAbsRGB"] compare:x[@"meanAbsRGB"]];}];
 NSData *j=[NSJSONSerialization dataWithJSONObject:diffs options:NSJSONWritingPrettyPrinted error:NULL];[j writeToFile:[out stringByAppendingPathComponent:@"scene-differences.json"] atomically:YES];
 AVAssetImageGenerator *g=[AVAssetImageGenerator assetImageGeneratorWithAsset:a];g.appliesPreferredTrackTransform=YES;g.maximumSize=CGSizeMake(960,540);g.requestedTimeToleranceBefore=kCMTimeZero;g.requestedTimeToleranceAfter=kCMTimeZero;
 for(double sec=80;sec<=88;sec+=0.5){CGImageRef im=[g copyCGImageAtTime:CMTimeMakeWithSeconds(sec,600) actualTime:NULL error:&err];if(!im)return 2;NSBitmapImageRep *rep=[[NSBitmapImageRep alloc]initWithCGImage:im];[[rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}]writeToFile:[out stringByAppendingPathComponent:[NSString stringWithFormat:@"source-%.1f.png",sec]] atomically:YES];CGImageRelease(im);}
 puts([[NSString alloc]initWithData:[NSJSONSerialization dataWithJSONObject:[rank subarrayWithRange:NSMakeRange(0,MIN(20,rank.count))] options:NSJSONWritingPrettyPrinted error:NULL] encoding:NSUTF8StringEncoding].UTF8String);return 0;
}}
