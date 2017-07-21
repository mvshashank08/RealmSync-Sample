import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,


  View,
  Platform,
  TextInput
} from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Item, Input, Text, ListItem } from 'native-base';
import { ListView } from 'realm/react-native';
var Realm = require('realm');

const MessageSchema = {
  name: 'Message',
  properties:{
    text: 'string',
    time: 'string',
    author: 'string'
  }
}


export default class ChatScreen extends Component {
  constructor(props){
    super(props);


    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});

    this.state = {
      message: "",
      dataSource: ds.cloneWithRows([])
    };

    this.buttonHandler = this.buttonHandler.bind(this);
    this.deleteHandler = this.deleteHandler.bind(this);

    var username = (Platform.OS === 'ios'? "user": "user")
    var password = (Platform.OS === 'ios'? "pass": "pass")
    console.log(username+" "+password);
    Realm.Sync.User.login('http://10.9.9.5:9080', username, password, (error, user) => {

      if(!error){
        console.log("Hurray! logged in");
        console.log(user);
        this.setState({username: username});

        this.realm = new Realm({
          sync: {
            user: user,
            url: 'realm://10.9.9.5:9080/~/realmtasks',
          },
          schema: [MessageSchema]
        });

        console.log(this.realm.objects('Message'));

        this.setState({dataSource: ds.cloneWithRows(this.realm.objects('Message'))});

        this.realm.addListener('change', () => {
    			this.setState({dataSource: ds.cloneWithRows(this.realm.objects('Message'))})
    		});
      }
      else{
        console.log(error);
      }

    });
  }

  componentWillMount(){

  }

  buttonHandler(){

    //get time string
    var timeString = (new Date().toLocaleTimeString())+ " " + (new Date().toLocaleDateString());
    this.realm.write(() => {
      this.realm.create('Message', {text: this.state.message, time: timeString, author: this.state.username});
    });

  }
  deleteHandler(){
    this.realm.write(() => {
      //delete all messages
      this.realm.delete(this.realm.objects('Message'));
    });
  }
  render() {
    return (
      <Container>
        <Header>
          <Left/>
          <Body>
            <Title>Chat Room</Title>
          </Body>
          <Right>
            <Button transparent onPress={this.deleteHandler}>
              <Text>Delete</Text>
            </Button>
          </Right>
        </Header>
        <Content>
        <ListView
          dataSource={this.state.dataSource}
          enableEmptySections={true}
          renderRow={	(message) =>
            <ListItem>
                <Body>
                  <Text>{message.author}</Text>
                  <Text note>{message.text}</Text>
                </Body>
                <Right>
                  <Text note>{message.time}</Text>
                </Right>
              </ListItem>
          }
        />
        </Content>
        <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <View style={{flex: 8}}>
            <Item>
              <Input placeholder='Type your message here ...' onChangeText={(text) => this.setState({message: text})}/>
            </Item>
          </View>
          <View style={{flex: 2}}>
            <Button transparent success
              onPress={this.buttonHandler}
            >
              <Text>Send</Text>
            </Button>
          </View>

        </View>
      </Container>
    );
  }
}
