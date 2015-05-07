/* @flow */

'use strict';

var React = require('react-native');
var { StyleSheet, ListView, View, Text, ActivityIndicatorIOS } = React;
var TopicListItem = require('./TopicListItem'), TopicView = require('./TopicView');
var { HOST, API_LATEST, API_SITE } = require('../config.js');
var _ = require('underscore');

var jsonHeader = {headers:{Accept:'application/json'}};

var TopicList = React.createClass({
  getInitialState() {
    this.users = {};
    this.topics = [];
    this.categories = null;
    this._prevY = 0;
    return {
      dataSource: new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id}),
      currentPage: 0,
      reloading: false,
      loadingNextPage: false
    };
  },

  selectTopic(topic) {
    // NavigatorIOS 컴포넌트의 자식 컴포넌트에는 navigator 객체가 프로퍼티로 전달된다.
    // 주제를 클릭할 때 navigator 객체에 push 메소드를 이용해 새 라우터를 추가해주면
    // 자동으로 다음 페이지로 이동한다.
    this.props.navigator.push({
      component: TopicView,
      title: '',
      passProps: { topic: topic }
    });
  },

  // 카테고리 정보를 불러온다.
  // 이미 불러왔으면 바로 resolve된 Promise 인스턴스를 반환한다.
  loadCategories() {
    if (this.categories) {
      return Promise.resolve(this.categories);
    } else {
      return fetch(HOST + API_SITE, jsonHeader).then(res => res.json()).then(data => {
        this.categories = {};
        data.categories.forEach(cate => this.categories[cate.id] = cate);
        return this.categories;
      });
    }
  },

  /**
   * 원격 API로부터 JSON 데이터를 가져오고 Promise 인스턴스를 반환한다.
   *
   * 타입체커에서 확인할 수 있도록 page 인수의 타입을 number로 설정했다.
   * page 뒤에 붙은 ? 표시는 이 값이 생략될 수도 있다는 뜻이다.
   */
  loadPage(page?: number) {
    var url = (page === undefined) ? this.moreURL : API_LATEST.replace('{page}', page);

    var req = fetch(HOST + url, jsonHeader).then(res => res.json());

    return Promise.all([req, this.loadCategories()])
      .then(([data, categories]) => {
        data.users.forEach( user => {
          this.users[user.id] = user;
        });

        var topics = data.topic_list.topics.map( topic => {
          topic = _.pick(topic, 'id', 'title', 'posters', 'category_id', 'pinned', 'created_at', 'posts_count', 'views');
          topic.posters.map( (poster) => _.extend(poster, this.users[poster.user_id]) );
          topic.category = this.categories[topic.category_id];

          return topic;
        });

        this.moreURL = data.topic_list.more_topics_url;
        this.topics  = (page===0?[]:this.topics).concat(topics);
        this.setState({
          currentPage: page,
          dataSource: this.state.dataSource.cloneWithRows(this.topics)
        });
      })
      .catch(reason => {
        console.log(reason);
      });
  },

  reloadTopics() {
    if (this.state.reloading) return;

    Promise.all([
      this.loadPage(0),
      new Promise( resolve => this.setState({reloading: true}, resolve) ),
      new Promise( resolve => setTimeout(() => resolve(), 1500) )
    ]).then( () => this.setState({reloading: false}) );
  },

  renderTopic(topic) {
    return <TopicListItem topic={topic} onSelect={this.selectTopic} />;
  },

  renderHeader() {
    if (!this.state.reloading) return null;

    return (
      <View style={styles.loadingIndicator}>
        <ActivityIndicatorIOS size="small" />
      </View>
    );
  },

  renderFooter() {
    if (!this.state.loadingNextPage || this.state.reloading) return null;

    return (
      <View style={styles.loadingIndicator}>
        <ActivityIndicatorIOS size="small" />
      </View>
    );
  },

  render() {
    return (
      <ListView
        ref="listView"
        style={styles.listView}
        scrollEventThrottle={10}
        removeClippedSubviews={true}
        dataSource={this.state.dataSource}
        renderRow={this.renderTopic}
        renderHeader={this.renderHeader}
        renderFooter={this.renderFooter}
        onScroll={this.handleScroll}
        onEndReached={this.handleEndReached}
      />
    );
  },

  handleScroll(event) {
    var posY = event.nativeEvent.contentOffset.y;
    if (posY < this._prevY && posY < -100) {
      this.reloadTopics();
    }
    this._prevY = posY;
  },

  handleEndReached() {
    if (this.state.loadingNextPage) return;

    Promise.all([
      this.loadPage(),
      new Promise( resolve => this.setState({loadingNextPage: true}, resolve) ),
      new Promise( resolve => setTimeout(()=>resolve(), 1000) ),
    ]).then( () => this.setState({loadingNextPage: false}) );
  },

  componentDidMount() {
    if (this.topics.length === 0) {
      this.reloadTopics();
    }
  }
});

var styles = StyleSheet.create({
  listView: {
    backgroundColor: '#eee'
  },
  loadingIndicator: {
    flex:1,
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 15,
  }
});

module.exports = TopicList;
