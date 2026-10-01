import path from 'node:path';
export function proposeProfileArgument(args,profile){
  if(typeof profile!=='string'||!path.isAbsolute(profile)||/[\s"'\x00-\x1f]/.test(profile))throw Error('UNAMBIGUOUS_ABSOLUTE_PROFILE_REQUIRED');
  if(typeof args!=='string'||(args.match(/--user-data-dir=/g)||[]).length!==1)throw Error('SINGLE_PROFILE_ARGUMENT_REQUIRED');
  const replaced=args.replace(/--user-data-dir=(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s]+)/, '--user-data-dir='+profile);
  if(replaced===args&&!args.includes('--user-data-dir='+profile))throw Error('PROFILE_REPLACEMENT_FAILED');
  return replaced;
}
