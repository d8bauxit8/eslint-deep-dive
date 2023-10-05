import { readJSONSync } from 'fs-extra';
import { install, set } from 'husky';
import { info } from 'npmlog';

const isCi: boolean = process.env.CI !== undefined;

if (!isCi) {
  install();

  const packageJSONPath = './package.json' as const;

  const gitHookNames = [
    'applypatch-msg',
    'pre-push',
    'commit-msg',
    'pre-rebase',
    'fsmonitor-watchman',
    'pre-receive',
    'post-update',
    'prepare-commit-msg',
    'pre-applypatch',
    'push-to-checkout',
    'pre-commit',
    'update',
    'pre-merge-commit',
  ] as const;
  type GitHookName = (typeof gitHookNames)[number];

  const hasScriptsKey = (packageJSON: unknown): packageJSON is Readonly<Record<'scripts', Readonly<Record<GitHookName, string>>>> =>
    !!packageJSON && typeof packageJSON === 'object' && 'scripts' in packageJSON;

  const packageJSON: unknown = readJSONSync(packageJSONPath);

  if (hasScriptsKey(packageJSON)) {
    const { scripts } = packageJSON;
    const huskyHookPath = '.husky' as const;
    gitHookNames.forEach((gitHookName: GitHookName) => {
      const command: string | undefined = scripts[gitHookName];
      if (command) {
        info('Husky', `Set "${gitHookName}" hook to "${command}" command(s)`);
        set(`${huskyHookPath}/${gitHookName}`, command);
      }
    });
  }
} else {
  info('Husky', 'You are in CI mode, husky was not installed!');
}
