module.exports = `
<!doctype html>
<head>
</head>
<style>
  html,body {background:transparent;font-size:14px;width:100%;line-height:1.4;padding:0;margin:0;font-family:"Apple SD Gothic Neo",sans-serif}
  article,aside,details,figcaption,figure,footer,header,main,nav,section,summary {display:block}
  a {text-decoration:none}
  pre {width:98%;overflow:auto;background:#eee;padding:10px;box-sizing:border-box;line-height:1.2}
  pre, code {font-family:monospace}
  img {max-width:98%;height:auto}
  img.avatar {display:none}
  aside.onebox {border-left:5px solid #cfcfcf;background:#e9e9e9;margin:10px 0}
  aside.onebox .onebox-body:after {content:"";display:block;clear:both}
  aside.onebox .onebox-body img {max-height:80%;max-width:20%;float:left;margin-right:10px}
  aside.onebox .onebox-body img.onebox-avatar {width:90px;height:90px;max-width:none;max-height:none}
  .quote {border-left:5px solid #cfcfcf;background:#e9e9e9;margin:1em 0}
  .quote .title {padding:1em;padding-bottom:1px;color:#646464}
  .quote blockquote {margin-top:5px;padding:1em;margin:0}
  img.emoji {width:20px;height:20px;vertical-align:middle}
  blockquote>*:last-child {margin-bottom:0}
  iframe {max-width:100%}
  .youtube-container {position:relative;overflow:hidden;max-width:100%;height:0;}
  .youtube-container iframe {position:absolute;top:0;left:0;width:100%;height:100%}
</style>
<body>
{content}
<script>
window.onerror = function(error){
  alert(error);
}
window.unload = function(){
  return false;
}
document.body.addEventListener('click', function(event){
  event.preventDefault();
  if (event.target && event.target.tagName === 'A') {
    sendMessage('link', event.target.getAttribute('href'));
  }
});
document.addEventListener('DOMContentLoaded', function(event){
  sendMessage('height', document.body.scrollHeight);
});
window.addEventListener('load', function(event){
  sendMessage('height', document.body.scrollHeight);
});
var messageIndex = 0;
function sendMessage(type, data) {
  document.title = '!'+JSON.stringify({type:type, data:data});
  location.hash = '#'+messageIndex++;
}
</script>
</body>
</html>
`;
