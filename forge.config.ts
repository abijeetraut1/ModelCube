import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';
import { AutoUnpackNativesPlugin } from '@electron-forge/plugin-auto-unpack-natives';

const config: ForgeConfig = {
  packagerConfig: {
    icon: "./assets/icons/appIcon",
    asar: {
      unpack: "**/node_modules/@node-llama-cpp/**/*"
    },
    ignore: [
      /\/\.(?!vite)/,
      /^\/src\//,
      /^\/\.vscode\//,
      /^\/\.git\//,
      /^\/temp\//, // Ignore temp folder
      /^\/out\//, // Ignore output folder
    ],
    // Explicitly include native modules
    extraResource: [
      "./node_modules/@node-llama-cpp",
    ],
  },
  rebuildConfig: {
    force: true,
    onlyModules: ["@node-llama-cpp", "node-llama-cpp"],
  },
  makers: [
    // WINDOWS MAKERS
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        setupIcon: './assets/icons/appIcon.ico',
        authors: 'Team Modelcube',
        description: 'Allows models to run locally'
      }
    },
    {
      name: '@electron-forge/maker-wix',
      platforms: ['win32'],
      config: {
        icon: './assets/icons/appIcon.ico',
        manufacturer: 'Team Modelcube',
        description: 'Allows models to run locally',
        ui: {
          chooseDirectory: true
        }
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32']
    },

    // MACOS MAKERS
    {
      name: '@electron-forge/maker-dmg',
      platforms: ['darwin'],
      config: {
        icon: './assets/icons/appIcon.icns',
        name: 'ModelCube',
        title: 'ModelCube ${version}',
        format: 'ULFO'
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },

    // LINUX MAKERS
    {
      name: '@electron-forge/maker-deb',
      platforms: ['linux'],
      config: {
        options: {
          name: 'modelcube',
          maintainer: 'Team Modelcube <team@modelcube.com>',
          homepage: 'http://modelcube.vercel.app/',
          icon: './assets/icons/appIcon.png',
          description: 'Allows models to run locally',
          categories: ['Science', 'Development', 'Utility']
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      platforms: ['linux'],
      config: {
        options: {
          name: 'modelcube',
          maintainer: 'Team Modelcube <team@modelcube.com>',
          homepage: 'http://modelcube.vercel.app/',
          icon: './assets/icons/appIcon.png',
          description: 'Allows models to run locally',
          categories: ['Science', 'Development', 'Utility'],
          license: 'MIT'
        }
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux']
    }
  ],
  plugins: [
    new AutoUnpackNativesPlugin({
      // Specifically handle node-llama-cpp
      unpackPattern: "**/node_modules/@node-llama-cpp/**/*"
    }),
    new VitePlugin({
      build: [
        {
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;