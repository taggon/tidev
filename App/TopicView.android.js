/* @flow */

'use strict';

var React = require('react-native');
var { createClass, StyleSheet, ScrollView, View, Text, Image, ProgressBarAndroid } = React;

var WebViewAndroid = require('react-native-webview-android');
var WebIntent = require('react-native-webintent');

var { HOST, API_TOPIC } = require('../config.js');
var TopicMixin = require('./TopicMixin');
var contentTemplate = require('./contentTemplate');

var TopicView = createClass({
  mixins: [TopicMixin],

  getInitialState() {
    return this.props.topic;
  },

  _handleBackButtonPress() {
    this.props.navigator.pop();
  },

  overcook(html: number) {
    // 이미지 경로 수정
    html = html.replace(/\bsrc="\/\//g, 'src="http://');
    html = html.replace(/\bsrc="\/(?=[^\/])/, 'src="'+HOST+'/');

    // support youtube
    html = html.replace(/<div .*?data-youtube-id="(.+?)"(.*?)><\/div>/g, ($0,id,$2) => {
      var width, height, ratio = 56.25; // 16:9 ratio
      if (width = /\b(?:data-)?width="(\d+)"/.exec($2)) {
        width = +width[1];
      }
      if (height = /\b(?:data-)?height="(\d+)"/.exec($2)) {
        height = +height[1];
      }
      if (width && height) {
        ratio = height/width * 100;
      }

      return `<div class="youtube-container" style="padding-bottom:${ratio}%"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0"></iframe></div>`;
    });

    return contentTemplate.replace('{content}', html);
  },

  /**
   * componentDidMount()와 마찬가지로 이 메소드 역시 컴포넌트 인스턴스당 한 번만 발생하기 때문에
   * 1번만 실행하면 되는 동작을 위해 사용한다. fetch() 통신에 걸릴 시간을 감안해
   * componentDidMount()가 아닌componentWillMount()를 사용해 조금 더 빨리 불러오도록 했다.
   */
  componentWillMount() {
    fetch(HOST + API_TOPIC.replace('{id}', this.state.id), {headers:{accept:'application/json'}})
      .then(res => res.json())
      .then(data => {
        this.setState({posts: data.post_stream.posts});
      })
      .catch(reason => {
        console.log(reason);
      })
      .done();
  },

  /**
   * Native와 달리 컨텐츠의 높이에 접근할 수 있는 방법이 아직 없기때문에
   * 자바스크립트로 location.hash 값을 변경시켜 onNavigationStateChange 이벤트를 발생시키고
   * 그 때의 document.title을 JSON 형식으로 해석하여 메시지를 주고받는다.
   * 이 방식을 사용해 자동으로 높이 조절을 하거나, 외부 링크를 사파리로 여는 동작을 구현할 수 있다.
   */
  handleNavigationStateChange(navState, ref) {
    if (!navState.title || navState.title.indexOf('!') !== 0) return;

    var msg = JSON.parse(navState.title.substr(1));
    switch (msg.type) {
      case 'height':
        var state = {}; state[ref+'Height'] = msg.data;
        this.setState( state );
        break;
      case 'link':
        if (/^https?:/i.test(msg.data)) {
            WebIntent.open(msg.data);
        }
        break;
    }
  },

  render() {
    var posts = this.state.posts, content;

    // 게시물을 아직 불러오지 못한 상태면 액티비티 인디케이터를 화면에 표시한다.
    if (!posts || posts.length === 0) {
      posts = [];
      content = <ProgressBarAndroid style={styles.loading} size="large" />;
    }

    return (
      <ScrollView>
        <View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{this.state.title}</Text>
            <View style={styles.metaContainer}>
              <View style={[styles.category, {backgroundColor:'#'+this.state.category.color}]}></View>
              <Text style={styles.meta}>
                {this.state.category.name} · {this.getFormattedDate(this.state.created_at)} · {this.state.views}명 읽음
              </Text>
            </View>
          </View>
          {content}
          {posts.map(post => {
            var ref = 'webview'+post.id;
            return (
              <View key={post.id} style={styles.post}>
                <View style={styles.user}>
                  <Image source={{uri:this.getAvatarURL(post.avatar_template, 40)}} style={styles.avatar} />
                  <View style={{flex:1}}>
                    <Text style={styles.username}>{post.username} / {post.name}</Text>
                    <Text style={styles.username}>{this.getFormattedDate(post.created_at)}</Text>
                  </View>
                </View>
                <WebViewAndroid
                  ref={ref}
                  bounces={false}
                  scrollEnabled={false}
                  automaticallyAdjustContentInsets={false}
                  onNavigationStateChange={(state) => this.handleNavigationStateChange(state, ref)}
                  style={[styles.webView, this.state[ref+'Height'] && {height:this.state[ref+'Height']}]}
                  html={this.overcook(post.cooked)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
  }
});

var styles = StyleSheet.create({
  title: {
    fontSize: 16
  },
  titleContainer: {
    padding: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1
  },
  category: {
    width: 8,
    height: 8,
    marginRight: 4,
    borderRadius: 4
  },
  metaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5
  },
  meta: {
    color: '#777',
    fontSize: 12
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80
  },
  post: {
    padding:10,
    paddingLeft:15,
    paddingRight:15,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd'
  },
  webView: {
    flex: 1,
    marginTop: 10,
    height: 5
  },
  avatar: {
    borderRadius: 20,
    width: 40,
    height: 40
  },
  user: {
    flex:1,
    flexDirection: 'row'
  },
  username: {
    marginTop: 2,
    marginLeft: 10,
    fontSize: 13,
    color: '#333'
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'flex-end'
  }
});

module.exports = TopicView;
