'use strict';

var React = require('react-native');
var { Navigator, StyleSheet } = React;

var TopicList = require('./TopicList.android');
var TopicView = require('./TopicView.android');

var App = React.createClass({
  render:  function () {
      return (
        <Navigator
        title='TiveDev'
        style={styles.container}
          initialRoute={{
              id: 'List',
                name: 'Tidev',
                index: 0
              }}
              renderScene={(route, navigator) => this._router(route, navigator)}
        />
      );
  },

  _router: function (route, navigator) {
        var routeId = route ? route.id : 'List';

        switch (routeId) {
            case "List":
                return (
                    <TopicList
                        navigator={navigator}
                        name={routeId}
                    />
                );
            case "Item":
                return (
                    <TopicView
                        topic={route.passProps.topic}
                    />
                );
        }
    }

});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
});

module.exports = App;
