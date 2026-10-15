#import <Foundation/Foundation.h>
#import <AVFoundation/AVFoundation.h>
#import <CommonCrypto/CommonDigest.h>
static CMTime T(double d){return CMTimeMakeWithSeconds(d,60000);}
static BOOL exportAsset(AVAsset *a,NSString *preset,NSString *path,AVVideoComposition *vc){
 NSError *err=nil;[[NSFileManager defaultManager]removeItemAtPath:path error:&err];
 AVAssetExportSession *e=[[AVAssetExportSession alloc]initWithAsset:a presetName:preset];e.outputURL=[NSURL fileURLWithPath:path];e.outputFileType=AVFileTypeMPEG4;e.shouldOptimizeForNetworkUse=YES;if(vc)e.videoComposition=vc;
 dispatch_semaphore_t sem=dispatch_semaphore_create(0);[e exportAsynchronouslyWithCompletionHandler:^{dispatch_semaphore_signal(sem);}];dispatch_semaphore_wait(sem,DISPATCH_TIME_FOREVER);
 if(e.status!=AVAssetExportSessionStatusCompleted){fprintf(stderr,"export %s failed: %s\n",path.UTF8String,e.error.description.UTF8String);return NO;}return YES;
}
static NSString *audioHash(AVAsset *a,NSUInteger *count){NSError *err=nil;AVAssetReader *r=[[AVAssetReader alloc]initWithAsset:a error:&err];AVAssetTrack *t=[a tracksWithMediaType:AVMediaTypeAudio].firstObject;if(!t)return nil;
 AVAssetReaderTrackOutput *o=[[AVAssetReaderTrackOutput alloc]initWithTrack:t outputSettings:nil];[r addOutput:o];if(![r startReading])return nil;CC_SHA256_CTX c;CC_SHA256_Init(&c);CMSampleBufferRef s;NSUInteger n=0;
 while((s=[o copyNextSampleBuffer])){CMBlockBufferRef b=CMSampleBufferGetDataBuffer(s);size_t len=CMBlockBufferGetDataLength(b);NSMutableData *d=[NSMutableData dataWithLength:len];CMBlockBufferCopyDataBytes(b,0,len,d.mutableBytes);CC_SHA256_Update(&c,d.bytes,(CC_LONG)len);n+=CMSampleBufferGetNumSamples(s);CFRelease(s);}
 if(r.status!=AVAssetReaderStatusCompleted)return nil;unsigned char digest[CC_SHA256_DIGEST_LENGTH];CC_SHA256_Final(digest,&c);NSMutableString *hex=[NSMutableString string];for(int i=0;i<CC_SHA256_DIGEST_LENGTH;i++)[hex appendFormat:@"%02x",digest[i]];*count=n;return hex;
}
int main(){@autoreleasepool{
 NSString *base=@"/Users/fordeargamers/the-exoduser/output/warrior-intro-contact-cut-20261016";
 NSString *review=[base stringByAppendingPathComponent:@"REVIEW"];[[NSFileManager defaultManager]createDirectoryAtPath:review withIntermediateDirectories:YES attributes:nil error:NULL];
 NSString *src=@"/Users/fordeargamers/the-exoduser/output/warrior-intro-latest-20261011/REVIEW/EXODUSER_WARRIOR_INTRO_20261008_REVIEW.mp4";
 AVURLAsset *a=[AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:src] options:nil];AVAssetTrack *sv=[a tracksWithMediaType:AVMediaTypeVideo].firstObject;NSError *err=nil;
 AVMutableComposition *comp=[AVMutableComposition composition];AVMutableCompositionTrack *v=[comp addMutableTrackWithMediaType:AVMediaTypeVideo preferredTrackID:kCMPersistentTrackID_Invalid];
 if(![v insertTimeRange:CMTimeRangeFromTimeToTime(kCMTimeZero,T(81)) ofTrack:sv atTime:kCMTimeZero error:&err])goto fail;
 if(![v insertTimeRange:CMTimeRangeFromTimeToTime(T(84),T(87.5)) ofTrack:sv atTime:T(81) error:&err])goto fail;
 [v scaleTimeRange:CMTimeRangeMake(T(81),T(3.5)) toDuration:T(6.5)];
 if(![v insertTimeRange:CMTimeRangeFromTimeToTime(T(87.5),a.duration) ofTrack:sv atTime:T(87.5) error:&err])goto fail;v.preferredTransform=sv.preferredTransform;
 {
 AVMutableVideoComposition *vc=[AVMutableVideoComposition videoCompositionWithPropertiesOfAsset:comp];vc.frameDuration=CMTimeMake(1,60);vc.renderSize=CGSizeMake(1920,1080);
 NSString *videoOnly=[base stringByAppendingPathComponent:@"video-only-intermediate.mp4"];
 if(!exportAsset(comp,AVAssetExportPresetHighestQuality,videoOnly,vc))return 2;
 AVURLAsset *vr=[AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:videoOnly] options:nil];AVMutableComposition *mux=[AVMutableComposition composition];AVMutableCompositionTrack *mv=[mux addMutableTrackWithMediaType:AVMediaTypeVideo preferredTrackID:kCMPersistentTrackID_Invalid];
 if(![mv insertTimeRange:CMTimeRangeMake(kCMTimeZero,a.duration) ofTrack:[vr tracksWithMediaType:AVMediaTypeVideo].firstObject atTime:kCMTimeZero error:&err])goto fail;
 for(AVAssetTrack *sa in [a tracksWithMediaType:AVMediaTypeAudio]){AVMutableCompositionTrack *ma=[mux addMutableTrackWithMediaType:AVMediaTypeAudio preferredTrackID:kCMPersistentTrackID_Invalid];if(![ma insertTimeRange:CMTimeRangeMake(kCMTimeZero,a.duration) ofTrack:sa atTime:kCMTimeZero error:&err])goto fail;}
 NSString *full=[review stringByAppendingPathComponent:@"EXODUSER_WARRIOR_INTRO_CONTACT_CUT_V1_20261016_REVIEW.mp4"];
 if(!exportAsset(mux,AVAssetExportPresetPassthrough,full,nil))return 3;
 AVURLAsset *final=[AVURLAsset URLAssetWithURL:[NSURL fileURLWithPath:full] options:nil];NSUInteger sc=0,fc=0;NSString *sh=audioHash(a,&sc),*fh=audioHash(final,&fc);if(!sh||![sh isEqual:fh]||sc!=fc){fprintf(stderr,"original AAC payload mismatch\n");return 4;}
 AVMutableComposition *excerpt=[AVMutableComposition composition];for(AVAssetTrack *track in final.tracks){AVMutableCompositionTrack *et=[excerpt addMutableTrackWithMediaType:track.mediaType preferredTrackID:kCMPersistentTrackID_Invalid];if(![et insertTimeRange:CMTimeRangeMake(T(78),T(12)) ofTrack:track atTime:kCMTimeZero error:&err])goto fail;}
 NSString *clip=[review stringByAppendingPathComponent:@"EXODUSER_WARRIOR_INTRO_CONTACT_CUT_78-90s_20261016_REVIEW.mp4"];if(!exportAsset(excerpt,AVAssetExportPresetPassthrough,clip,nil))return 5;
 NSDictionary *receipt=@{@"source":src,@"output":full,@"excerpt":clip,@"sourceDuration":@(CMTimeGetSeconds(a.duration)),@"outputDuration":@(CMTimeGetSeconds(final.duration)),@"removedVisualSourceRange":@[@81,@84],@"replacementVisualSourceRange":@[@84,@87.5],@"replacementOutputRange":@[@81,@87.5],@"replacementSpeed":@(3.5/6.5),@"audioPayloadSHA256Source":sh,@"audioPayloadSHA256Output":fh,@"sourceAudioPackets":@(sc),@"outputAudioPackets":@(fc),@"audioCompressedPayloadExactMatch":@YES,@"fullSubjectiveWatch":@"NOT_PERFORMED",@"actualListening":@"UNHEARD",@"publicApproval":@NO,@"uploaded":@NO};
 NSData *j=[NSJSONSerialization dataWithJSONObject:receipt options:NSJSONWritingPrettyPrinted error:NULL];[j writeToFile:[review stringByAppendingPathComponent:@"render-receipt.json"] atomically:YES];puts([[NSString alloc]initWithData:j encoding:NSUTF8StringEncoding].UTF8String);return 0;}
 fail: fprintf(stderr,"composition error: %s\n",err.description.UTF8String);return 1;
}}
