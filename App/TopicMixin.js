var { PixelRatio } = require('react-native');
var { HOST } = require('../config.js');

module.exports = {
  getFormattedDate(createdTimestamp) {
    var created = Date.parse(createdTimestamp), elapsed = (Date.now() - created)/1000; // seconds

    if (elapsed < 10) return '방금 전';
    if (elapsed < 60) return (elapsed%60)+'초 전';
    if (elapsed < 3600) return Math.round(elapsed/60)+'분 전';
    if (elapsed < 86400) return Math.round(elapsed/3600)+'시간 전';
    if (elapsed < 525600) return Math.round(elapsed/86400)+'일 전';

    var createdDate = new Date(created);
    return createdDate.getFullYear()+'-'+(createdDate.getMonth()+1)+'-'+createdDate.getDate();
  },

  getAvatarURL(urlTemplate, size) {
    size = Math.round(size * PixelRatio.get());
    var url = HOST + urlTemplate.replace('{size}', size);

    if (/\/letter_avatar\//.test(url)) {
      url = url.replace(/\/[^\/]+$/, '/3_64b268823de25c3c4365087b878b9ba2.png');
    }

    return url;
  }
};
