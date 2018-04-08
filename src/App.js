import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'
import { Link } from 'react-router-dom'
import { Route } from 'react-router-dom'
import defaultCover from './defaultCover.jpg'


class BooksApp extends React.Component {

	state = {
		searchBooks: [],
		//这个是一个记录书和书架对应关系的字典，键是书的ID，值是书架名称
		bookToShelf: {},
		//存储所有书架上的书的状态
		books: {}
	}


	//初始化的AJAX请求，获取当前用户所有的书架上的书的数据
	componentDidMount() {
		BooksAPI.getAll().then((book) => {
			book.map((eachBook) => {
				// this.addBookToShelf(eachBook);
				this.setState((preState) => {

					let bts = Object.assign({}, preState.bookToShelf);
					bts[eachBook.id] = eachBook.shelf;

					//如果当前shelf标签已经创建，就直接push到对应标签的数组里
					if (preState.books[eachBook.shelf]) {
						//深拷贝对象
						let temp = Object.assign({}, preState.books);
						temp[eachBook.shelf].push(eachBook);
						//更新state
						return {books: temp, bookToShelf: bts};
					} else {
						//如果当前标签没有被创建，就新建一个数组再Push
						//深拷贝对象
						let temp = Object.assign({}, preState.books);
						temp[eachBook.shelf] = [eachBook];
						//更新state
						return {books: temp, bookToShelf: bts};
					}
				})
				return null;
			})
		})
	}


	//处理用户键入搜索关键字的函数
	handleChange = (event) => {
		let query = event.target.value;
		//check一下搜索的字符是不是空字符
		if (query !== '') {
			//发送api请求，搜索书目
			BooksAPI.search(query).then((book) => {
					//如果没有搜索到这本书
					if (book.error && book.error === 'empty query') {
						this.setState({searchBooks: []})
					} else {
						//搜索到了
						this.setState({searchBooks: book})
					}
			})
		}
	}

	shelfChange = (event, book) => {
		let newShelf = event.target.value;
		//确保用户选择的不是none选项
		if (newShelf !== 'none') {
			// 再发送ajax请求到服务器通知更改
			BooksAPI.update(book, newShelf).then((a) => {

				//服务器状态修改成功后，更改本地状态
				this.setState((preState) => {
					//获取旧书架的值
					let oddShelf = preState.bookToShelf[book.id];
					//改变书->书架的键值对
					let temp1 = Object.assign({}, preState.bookToShelf);
					temp1[book.id] = newShelf;
					let temp2 = Object.assign({}, preState.books);
					if (temp2[oddShelf]) {
						//如果该书存在，将该书从旧书架中删除
						temp2[oddShelf] = temp2[oddShelf].filter((b) => {
							return b.id !== book.id
						})
					}
					//在新的书架中添加该书
					temp2[newShelf].push(book);
					return {bookToShelf: temp1, books: temp2}
				})
			});

		}
	}

	render() {
		return (

			<div className="app">
				<Route exact path="/search" render={() => (
					<div className="search-books">
					  <div className="search-books-bar">
						<Link to='/' className="close-search">Close</Link>
						<div className="search-books-input-wrapper">
						  <input type="text" placeholder="Search by title or author" onChange={this.handleChange}/>
						</div>
					  </div>
					  <div className="search-books-results">
						<ol className="books-grid">
							{this.state.searchBooks? this.state.searchBooks.map((book) => (
								<Book key={book.id} detail={book} shelfChange={this.shelfChange} shelfNum={this.state.bookToShelf}/>
							)): {} }
						</ol>
					  </div>
					</div>
				)}/>

				<Route exact path="/" render={() => (
					  <ListBooks shelfChange={this.shelfChange} books={this.state.books}  shelfNum={this.state.bookToShelf}/>
				)}/>
			</div>
		)
	}
}


// 所有书架集合
class ListBooks extends React.Component {

	render() {
		let content = [];
		let count = 0;
		for (let shelf of Object.keys(this.props.books)) {
			content.push(<BookShelf books={this.props.books[shelf]} key={count} shelf={shelf} shelfChange={this.props.shelfChange}  shelfNum={this.props.shelfNum}/>);
			count ++;
		}

		return (
			<div className='list-books'>
				<div className="list-books-title">
					<h1>MyReads</h1>
				</div>
				<div className="list-books-content">
					<div>
						{content}
					</div>
				</div>
				<div className="open-search">
				  <Link to="/search">Add a book</Link>
				</div>
			</div>
		)
	}
}


//书架组件
class BookShelf extends React.Component {

	render() {
		let title = {
			'currentlyReading':'Currently Reading',
			'wantToRead':'Want to Read',
			'read':'Read'
		}

		return (
			<div className="bookshelf">
			  <h2 className="bookshelf-title">{title[this.props.shelf]}</h2>
			  <div className="bookshelf-books">
				<ol className="books-grid">
				{this.props.books.map(book => (
				 	<li key={book.id}><Book detail={book} shelfChange={this.props.shelfChange} shelfNum={this.props.shelfNum}/></li>
				))}
				</ol>
			  </div>
			</div>
		)
	}
}



//每本书的组件
class Book extends React.Component {
	render() {

		//这边是处理选项框前面个勾的
		let shelfName = {'currentlyReading':'\u00A0\u00A0\u00A0Currently Reading',
						'wantToRead':'\u00A0\u00A0\u00A0Want to Read',
						'read':'\u00A0\u00A0\u00A0Read',
						'none':'\u00A0\u00A0\u00A0None'};

		let bookid = this.props.detail.id;
		if (this.props.shelfNum.hasOwnProperty(bookid)) {
			shelfName[this.props.shelfNum[bookid]] = '✓' + shelfName[this.props.shelfNum[bookid]].substr(3, shelfName[this.props.shelfNum[bookid]].length);
		} else {
			shelfName['none'] = '✓' + shelfName['none'].substr(3, shelfName['none'].length);
		}



		return (
			<div className="book">
			  <div className="book-top">
				<div className="book-cover" style={{ width: 128, height: 193, backgroundImage:`url(${this.props.detail.imageLinks ? this.props.detail.imageLinks.smallThumbnail : defaultCover})` }}></div>
				<div className="book-shelf-changer">
				  <select value="none" onChange={(val) => this.props.shelfChange(val, this.props.detail)}>
					<option value="none" disabled>&nbsp;&nbsp;&nbsp;Move to...</option>
					<option value="currentlyReading">{shelfName['currentlyReading']}</option>
					<option value="wantToRead">{shelfName['wantToRead']}</option>
					<option value="read">{shelfName['read']}</option>
					<option value="none">{shelfName['none']}</option>
				  </select>
				</div>
			  </div>
			  <div className="book-title">{this.props.detail.title}</div>
			  <div className="book-authors">{this.props.detail.authors}</div>
			</div>
		)
	}
}


export default BooksApp
