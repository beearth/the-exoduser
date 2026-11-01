// Minimal caller for the already installed libwebp 1.6.0 exported by sharp's libvips.
// Public ABI structures and constants follow libwebp v1.6.0 src/webp/encode.h.
#include <stdint.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <dlfcn.h>

#define WEBP_ENCODER_ABI_VERSION 0x0210
typedef struct WebPConfig {
  int lossless; float quality; int method; int image_hint; int target_size;
  float target_PSNR; int segments; int sns_strength; int filter_strength;
  int filter_sharpness; int filter_type; int autofilter; int alpha_compression;
  int alpha_filtering; int alpha_quality; int pass; int show_compressed;
  int preprocessing; int partitions; int partition_limit; int emulate_jpeg_size;
  int thread_level; int low_memory; int near_lossless; int exact;
  int use_delta_palette; int use_sharp_yuv; int qmin; int qmax;
} WebPConfig;
typedef struct WebPPicture WebPPicture;
typedef int (*WebPWriterFunction)(const uint8_t*, size_t, const WebPPicture*);
struct WebPPicture {
  int use_argb, colorspace, width, height;
  uint8_t *y, *u, *v; int y_stride, uv_stride;
  uint8_t *a; int a_stride; uint32_t pad1[2];
  uint32_t *argb; int argb_stride; uint32_t pad2[3];
  WebPWriterFunction writer; void* custom_ptr;
  int extra_info_type; uint8_t* extra_info; void* stats; int error_code;
  void* progress_hook; void* user_data; uint32_t pad3[3];
  uint8_t *pad4, *pad5; uint32_t pad6[8];
  void *memory_, *memory_argb_, *pad7[2];
};
typedef struct WebPMemoryWriter {
  uint8_t* mem; size_t size, max_size; uint32_t pad[1];
} WebPMemoryWriter;

static void* symbol(void* lib, const char* name) {
  void* fn=dlsym(lib,name);
  if(!fn){fprintf(stderr,"missing libwebp symbol %s: %s\n",name,dlerror());exit(2);}
  return fn;
}
int main(int argc,char** argv) {
  if(argc!=6){fprintf(stderr,"usage: exact-webp LIBVIPS RGBA.raw width height output.webp\n");return 2;}
  char* end=NULL;long w=strtol(argv[3],&end,10);if(*end||w<=0||w>16383)return 2;
  long h=strtol(argv[4],&end,10);if(*end||h<=0||h>16383)return 2;
  size_t n=(size_t)w*(size_t)h*4;
  FILE* input=fopen(argv[2],"rb");if(!input){perror("input");return 2;}
  uint8_t* rgba=malloc(n);if(!rgba){fclose(input);return 2;}
  if(fread(rgba,1,n,input)!=n||fgetc(input)!=EOF){fprintf(stderr,"raw input length mismatch\n");fclose(input);free(rgba);return 2;}
  fclose(input);
  void* lib=dlopen(argv[1],RTLD_NOW|RTLD_LOCAL);if(!lib){fprintf(stderr,"dlopen: %s\n",dlerror());free(rgba);return 2;}
  int (*version)(void)=symbol(lib,"WebPGetEncoderVersion");
  int (*config_init)(WebPConfig*,int,float,int)=symbol(lib,"WebPConfigInitInternal");
  int (*lossless_preset)(WebPConfig*,int)=symbol(lib,"WebPConfigLosslessPreset");
  int (*validate)(const WebPConfig*)=symbol(lib,"WebPValidateConfig");
  int (*picture_init)(WebPPicture*,int)=symbol(lib,"WebPPictureInitInternal");
  int (*import_rgba)(WebPPicture*,const uint8_t*,int)=symbol(lib,"WebPPictureImportRGBA");
  int (*encode)(const WebPConfig*,WebPPicture*)=symbol(lib,"WebPEncode");
  void (*picture_free)(WebPPicture*)=symbol(lib,"WebPPictureFree");
  void (*writer_init)(WebPMemoryWriter*)=symbol(lib,"WebPMemoryWriterInit");
  void (*writer_clear)(WebPMemoryWriter*)=symbol(lib,"WebPMemoryWriterClear");
  WebPWriterFunction memory_write=symbol(lib,"WebPMemoryWrite");
  if(version()!=0x010600){fprintf(stderr,"unexpected libwebp version %x\n",version());return 2;}
  WebPConfig config;
  if(!config_init(&config,0,75.f,WEBP_ENCODER_ABI_VERSION)||!lossless_preset(&config,9))return 2;
  config.exact=1;
  if(!validate(&config)){fprintf(stderr,"invalid exact lossless config\n");return 2;}
  WebPPicture picture;
  if(!picture_init(&picture,WEBP_ENCODER_ABI_VERSION))return 2;
  picture.use_argb=1;picture.width=(int)w;picture.height=(int)h;
  if(!import_rgba(&picture,rgba,(int)w*4)){fprintf(stderr,"RGBA import failed\n");return 2;}
  WebPMemoryWriter writer;writer_init(&writer);
  picture.writer=memory_write;picture.custom_ptr=&writer;
  if(!encode(&config,&picture)){fprintf(stderr,"WebP encode failed: %d\n",picture.error_code);return 2;}
  FILE* output=fopen(argv[5],"wb");if(!output){perror("output");return 2;}
  if(fwrite(writer.mem,1,writer.size,output)!=writer.size){perror("write");return 2;}
  fclose(output);
  fprintf(stdout,"%zu\n",writer.size);
  writer_clear(&writer);picture_free(&picture);free(rgba);dlclose(lib);
  return 0;
}
