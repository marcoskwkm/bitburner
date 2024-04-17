export const FILES = {
  BRUTE_SSH: 'BruteSSH.exe',
  FTP_CRACK: 'FTPCrack.exe',
  RELAY_SMTP: 'relaySMTP.exe',
  HTTP_WORM: 'HTTPWorm.exe',
  SQL_INJECT: 'SQLInject.exe',
} as const

export const SCRIPTS = {
  CONSTANTS: 'utils/constants.js',
  SIMPLE_HACK: 'hacking/simple-hack.js',
  SIMPLE_WEAKEN: 'hacking/simple-weaken.js',
  SIMPLE_GROW: 'hacking/simple-grow.js',
  TIMER: 'ui/timer.js',
  UTILS_TIME: 'utils/time.js',
} as const

export const HOSTS = {
  HOME: 'home',
  JOESGUNS: 'joesguns',
  MAX_HARDWARE: 'max-hardware',
}
