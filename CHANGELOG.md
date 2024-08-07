# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).



## [next] - YYYY-MM-DD
#### Added
#### Changed
#### Deprecated
#### Removed
#### Fixed
#### Security



## [3.0.0] - 2024-07-16
#### Changed
- converted to ESM (thanks to @ndelangen on PR#47)



## [2.4.7] - 2024-07-16
#### Fixed
- revert to bundle that supports `require('file-system-cache')` on patch-release 
  version number prior to re-releasing the ESM build on the next major version (see 3.0).



## [2.4.5] - 2024-07-16
#### Added
#### Changed
- switched testing framework from `mocha` to `vitest`
- switched `ts-node` to `tsx`
- converted to ESM (thanks to @ndelangen on PR#47)
#### Deprecated
#### Removed
#### Fixed
#### Security


## [2.4.4] - 2023-08-11
#### Fixed
- Expired item no longer throwing error on call to `getSync` (thanks @ejc3 for reporting)





## [2.4.3] - 2023-07-28
#### Fixed
- "@types/fs-extra" types as devDependency causing upstream issues (thanks @jbpenrath)
- Transpile errors within lib imports (thanks @hankyupark)


## [2.4.2] - 2023-06-8
#### Fixed
- Issue #33: "@types/ramda" types as devDependency causing upstream issues on `--skipLib`


## [2.4.1] - 2023-06-28
#### Fixed
- Cleared case difference in generated /lib folder (name "Util.js" → "util.js")


## [2.4.0] - 2023-06-27
#### Added
- multiple path hashing options (thanks @trevor-vaughan)


## [2.3.0] - 2023-05-22
#### Added
- `ttl` (time to live) to expire caches (thanks @douglaslinsmeyer)


## [2.1.0] - 2023-04-19
#### Changed
- Switched hashing algorithm from MD5 to SHA1 (thanks @rmarone)


## [2.0.2] - 2022-01-17
#### Security
- Updated (via package.json `{resolution}`) to `JSON5 >= 1.0.2` (which was marked as a security risk [see here](https://github.com/philcockfield/file-system-cache/security/dependabot/2))


## [2.0.1] - 2022-10-12
#### Changed
- Updated package.json dependencies


## [2.0.0] - 2022-05-14
#### Changed
- Converted project to Typescript
#### Fixed
- Update refs (ramda), thanks to @shernaz


## [1.1.0] - 2021-04-04
#### Changed
- bumped the ramda depedency version to resolve [ReDos](https://security.snyk.io/vuln/SNYK-JS-RAMDA-1582370)


## [1.0.3] - 2016-01-26
#### Changed
- Referencing [Babel](https://babeljs.io/) dependencies via `js-babel` and `js-babel-dev` modules.
- Linting updated to use [AirBnB style guide](https://github.com/airbnb/javascript).



## [0.0.1] - 2015-09-19
#### Added
Initial creation and publish.
