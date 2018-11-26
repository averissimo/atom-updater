/* eslint camelcase: ["error", { allow: ["per_page"] }] */

const octokit = require('@octokit/rest')();
const tar = require('tar');
const request = require('request');

const opts = require('./config.json');

// Retrieve information from github
octokit
  .repos
  .listReleases({
    owner: 'atom',
    repo: 'atom',
    per_page: 30,
    page: 1
  })
  .then(response => {
    // Sort releases by published date
    const releases = response
      .data
      .sort((a, b) => a.published_at.localeCompare(b.publised_at));

    // Get first
    if (releases.length > 0) {
      // Get amd64.tar.gz releases (should only be one)
      const amd = releases[0]
        .assets
        .filter(el => new RegExp(opts.regex, opts.regexFlags).test(el.name));

      if (amd.length > 0) {
        console.log(`Downloading release with tag ${releases[0].tag_name} (prerelease: ${Boolean(releases[0].prerelease)})`);
        console.log(`  Saving to directory: '${opts.path}'`);
        console.log('');
        // Download release and extract to path
        request(amd[0].browser_download_url)
          .on('error', error => {
            console.log('ERROR: ', error);
          })
          .on('response', () => {
            console.log('  Extracting...');
            console.log('    note: this could take a while.');
          })
          .pipe(
            tar.x({
              strip: 1,
              C: opts.path
            })
          );
      } else {
        console.log('NOTE: There is no amd64.tar.gz release');
      }
    } else {
      console.log('NOTE: There are no releases');
    }
  });
