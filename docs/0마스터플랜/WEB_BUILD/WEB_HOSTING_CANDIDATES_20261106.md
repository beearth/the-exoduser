# 웹 빌드 호스팅 후보 (공개 문서 조사)

조회일 2026-11-06. 실제 배포·전송 시험은 하지 않았다. 조사는 서브에이전트가 했다. 태그: [원문] 공식 문서 원본 직접 확인, [요약] 요약 도구·포럼, [미검증] 미확인. 비용 가정: 저장 약 600MB, 전송 100GB/월.

**결론: data.br 한 덩어리 500MB를 그대로 올릴 수 있는 곳은 S3 + CloudFront, Cloudflare R2, 자체 VPS다. itch.io·GitHub Pages·Cloudflare Pages는 파일당 한도에 걸린다.** 실제 응답 헤더는 호스트마다 올려 봐야 확정된다. 어느 후보든 예산 지출과 계정 생성은 사용자 결정이다.

| 호스트 | 파일당 | 총량 | `.br` + `Content-Encoding: br` | X-Frame-Options·iframe | COOP/COEP | 비용 |
|---|---|---|---|---|---|---|
| itch.io | 200MB, 압축 해제 기준 [원문] | 500MB, 1,000파일, 압축 해제 기준 [원문] | 자동 [원문] | itch 페이지 안 iframe [원문], 외부 삽입 [미검증] | [미검증] | [미검증] |
| GitHub Pages | 100MiB, 저장소 [원문] | 1GB [원문] | 불가로 보임 [요약] | [미검증] | 불가 [요약] | $0, 소프트 100GB/월 [원문] |
| Cloudflare Pages | 25MiB [원문] | [미검증], 20,000파일 [원문] | `_headers` 가능 [원문], 재인코딩 여부 [미검증] | [미검증] | `_headers` [원문] | $0 [원문], 약관 제한 있음 |
| Cloudflare R2 | 약 4.995TiB, 캐시 512MB(Free~Business) [원문] | [미검증] | 객체 메타데이터 [원문]. `no-transform` 권장, `.br`은 Cache Rule 필요 [원문] | [미검증] | Transform Rules [원문] | 10GB·이그레스 무료로 $0 [원문], 도메인 비용 별도 [미검증], 약관 제한 있음 |
| Netlify | [미검증] | [미검증] | **`Content-Encoding` 커스텀 헤더 "typically ignored"** [원문] | [미검증] | `_headers` [원문] | Free는 약 15GB에서 중지 [원문], 유료 약 $19~20 [원문, 적용가 미검증] |
| Vercel | [미검증] | CLI 업로드 Hobby 100MB, Pro 1GB [원문] | 재압축 보고 [요약], 공식 지원 근거 없음 | [미검증] | `vercel.json` [원문] | Hobby 비상업 전용 [원문], 온디맨드 $0.15/GB [원문] |
| S3 + CloudFront | 5GB PUT, 캐시 50GB [원문] | [미검증] | 메타데이터, CloudFront는 재압축 안 함 [원문] | 보안 헤더 정책으로 설정 [원문] | 응답 헤더 정책 [원문] | 전송 1TB 무료, 저장 약 $0.014/월 [원문], S3→CF 전송 [미검증] |
| 자체 VPS (DigitalOcean 예시) | [미검증] | 10GiB [원문] | 직접 설정 [요약] | 직접 제어 | 직접 제어 | $4/월, 500GiB 포함 [원문] |

## 출처

- itch.io: https://itch.io/docs/creators/html5
- GitHub: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github , https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits , https://github.com/orgs/community/discussions/13309
- Cloudflare Pages: https://developers.cloudflare.com/pages/platform/limits/ , https://developers.cloudflare.com/pages/configuration/headers/ , https://developers.cloudflare.com/pages/functions/pricing/
- R2·캐시: https://developers.cloudflare.com/r2/platform/limits/ , https://developers.cloudflare.com/cache/concepts/default-cache-behavior/ , https://developers.cloudflare.com/r2/api/s3/api/ , https://developers.cloudflare.com/speed/optimization/content/compression/ , https://developers.cloudflare.com/r2/buckets/public-buckets/ , https://developers.cloudflare.com/rules/transform/response-header-modification/ , https://developers.cloudflare.com/r2/pricing/
- Netlify: https://docs.netlify.com/manage/routing/headers/ , https://docs.netlify.com/deploy/deploy-overview/ , https://www.netlify.com/pricing/ , https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/
- Vercel: https://vercel.com/docs/limits , https://vercel.com/docs/compression , https://community.vercel.com/t/breaking-change-pre-compressed-assets-re-compressed-at-the-edge/18744 , https://vercel.com/docs/headers , https://vercel.com/docs/manage-cdn-usage , https://vercel.com/docs/limits/fair-use-guidelines
- AWS: https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html , https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-limits.html , https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingMetadata.html , https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ServingCompressedFiles.html , https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/understanding-response-headers-policies.html , https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/
- VPS: https://www.digitalocean.com/pricing/droplets , https://docs.unity3d.com/Manual/webgl-server-configuration-code-samples.html

## 주의

- **R2 캐시 한도 512MB:** 파일이 실제 500MiB(약 524MB)면 넘을 수 있다. data.br 566MB인 지금은 넘는다.
- **Cloudflare 약관:** Enterprise가 아닌 고객이 대용량 파일을 CDN으로 서빙하려면 유료 서비스를 쓰도록 하고, 위반 시 제한할 수 있다 [원문: https://www.cloudflare.com/service-specific-terms-application-services/]. R2 무료 등급과 게임 데이터가 여기 해당하는지는 [미검증].
- **분할:** Brotli 스트림을 바이트로 자르면 조각별 해제가 안 된다. 빌드·로더 변경이 필요하다(추론).
- **itch.io:** 현재 빌드는 압축 해제 기준 약 800MB라 총량 500MB도 넘는다(빌드 리포트 Complete build size 803.5MB).
- 미확인: 실제 헤더 동작 전반, 호스트별 X-Frame-Options 기본값, COOP/COEP를 이름으로 명시한 문서.
