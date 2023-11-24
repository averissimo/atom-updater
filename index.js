/* eslint camelcase: ["error", { allow: ["per_page"] }] */
const {Octokit} = require('@octokit/rest');
const tar = require('tar');
const axios = require('axios');
const semver = require('semver');
const log = require('loglevel');

// Log level
log.setLevel('info');

// Read configuration
const opts = require('./config.json');

// Create github object
const octokit = new Octokit();

// Function that downloads and extracts contents to configured directory
async function install() {
  // Retrieve information from github
  const response = await octokit.repos.listReleases({
    owner: 'pulsar-edit',
    repo: 'pulsar',
    per_page: 30,
    page: 1
  });

  // Sort releases by published date
  const releases = response
    .data
    .sort((a, b) => semver.compare(b.tag_name, a.tag_name))
    .filter(el => el.prerelease === false || el.prerelease === opts.prerelease);

  //  Debuging
  releases.forEach(el => log.debug(el.name, el.prerelease));

  // Get first release (latest)
  if (releases.length > 0) {
    // Get amd64.tar.gz releases (should only be one)
    const amd = releases[0]
      .assets
      .filter(el => new RegExp(opts.regex, opts.regexFlags).test(el.name));

    if (amd.length > 0) {
      log.info(`Downloading release with tag ${releases[0].tag_name} (prerelease: ${Boolean(releases[0].prerelease)})`);
      log.info(`  Saving to directory: '${opts.path}'`);
      log.info('');

      // Download release and extract to path
      axios({
        url: amd[0].browser_download_url,
        method: 'GET',
        responseType: 'stream'
      })
        .then(response => {
          log.info('    note: this could take a while and it will BREAK atom if it\'s not completed.');
          response.data.pipe(
            tar.x({
              strip: 1,
              C: opts.path
            })
          );
        })
        .catch(error => log.error('ERROR: ', error));
    } else {
      log.info('NOTE: There is no amd64.tar.gz release');
    }
  } else {
    log.info('NOTE: There are no releases');
  }
}

// Call on function
install();
