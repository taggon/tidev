'use strict';

var React = require('react-native');
var { NavigatorIOS, StyleSheet } = React;
var TopicList = require('./TopicList');

var App = React.createClass({
  render() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          title: 'Tidev',
          component: TopicList,
        }}
      />
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
});

module.exports = App;
