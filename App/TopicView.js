/* @flow */

'use strict';

var React = require('react-native');
var { createClass, StyleSheet, ScrollView, WebView, View, Text, Image, ActivityIndicatorIOS, LinkingIOS } = React;
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
          LinkingIOS.openURL(msg.data);
        }
        break;
    }
  },

  render() {
    var posts = this.state.posts, content;

    if (!posts || posts.length === 0) {
      posts = [];
      content = <ActivityIndicatorIOS style={styles.loading} size="large" />;
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
                <WebView
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
