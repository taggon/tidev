/* @flow */

'use strict';

var React = require('react-native');
var { Image, PixelRatio, StyleSheet, Text, TouchableHighlight, View } = React;
var TopicMixin = require('./TopicMixin');

var TopicListItem = React.createClass({
  mixins: [TopicMixin],

  handleSelect() {
    return this.props.onSelect(this.props.topic);
  },

  render() {
    var topic = this.props.topic, poster = topic.posters[0], avatar;

    if (!topic.category) {
      topic.category = {color:'ffffff'};
    }

    return (
      <View>
        <TouchableHighlight onPress={this.handleSelect}>
          <View style={[styles.row, topic.pinned && styles.pinned]}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{topic.title}</Text>
              <View style={styles.metaContainer}>
                <View style={[styles.category, {backgroundColor:'#'+topic.category.color}]}></View>
                <Text style={styles.meta}>
                  {topic.category.name} · {this.getFormattedDate(topic.created_at)} · {topic.views}명 읽음 · 댓글 {topic.posts_count-1}개
                </Text>
              </View>
            </View>
            <Image style={styles.avatar} source={{uri:this.getAvatarURL(poster.avatar_template, 25)}} />
          </View>
        </TouchableHighlight>
      </View>
    )
  }
});

var styles = StyleSheet.create({
  row: {
    alignItems: 'stretch',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  pinned: {
    backgroundColor: '#ffffcc'
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    marginRight: 10
  },
  title: {
    flex: 1,
    fontSize: 14,
    marginBottom: 2
  },
  metaContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  meta: {
    color: '#777',
    fontSize: 12
  },
  avatar: {
    borderRadius: 12,
    width: 25,
    height: 25
  },
  category: {
    width: 8,
    height: 8,
    marginRight: 4,
    borderRadius: 4
  }
});

module.exports = TopicListItem;
