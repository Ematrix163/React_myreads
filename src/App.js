import React from 'react'
import * as BooksAPI from './BooksAPI'
import './App.css'





class BooksApp extends React.Component {

	state = {
		/**
		 * TODO: Instead of using this state variable to keep track of which page
		 * we're on, use the URL in the browser's address bar. This will ensure that
		 * users can use the browser's back and forward buttons to navigate between
		 * pages, as well as provide a good URL they can bookmark and share.
		 */
		showSearchPage: false,
		searchBooks: [],
	}

	//处理用户键入搜索关键字的函数
	handleChange = (event) => {
		let query = event.target.value;
		//发送api请求，搜索书目
		BooksAPI.search(query).then((book) => {
			this.setState({
				searchBooks: book
			})
		})
	}

	render() {
		return (
			<div className="app">
				{this.state.showSearchPage ? (
				  <div className="search-books">
				    <div className="search-books-bar">
				      <a className="close-search" onClick={() => this.setState({ showSearchPage: false })}>Close</a>
				      <div className="search-books-input-wrapper">
				        {/*
				          NOTES: The search from BooksAPI is limited to a particular set of search terms.
				          You can find these search terms here:
				          https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

				          However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
				          you don't find a specific author or title. Every search is limited by search terms.
				        */}
				        <input type="text" placeholder="Search by title or author" onChange={this.handleChange}/>
				      </div>
				    </div>
				    <div className="search-books-results">

				      <ol className="books-grid">
						  {this.state.searchBooks.map((book) => (

							  //这边传数据是所有数据都传过去的，是不是只传有用的信息（名字作者）更高效？
							  <Book key={book.id} detail={book}/>
						  ))}
					  </ol>
				    </div>
				  </div>
				) : (
				  <ListBooks/>
				)}
			</div>
		)
	}
}



// 所有书架集合
class ListBooks extends React.Component {

	state = {
		books: {}
	}

	//初始化的AJAX请求，获取当前用户所有的书架上的书的数据
	componentDidMount() {
		BooksAPI.getAll().then((book) => {
			book.map((eachBook) => {
				this.setState((preState) => {
					//如果当前shelf标签已经创建，就直接push到对应标签的数组里
					if (preState.books[eachBook.shelf]) {
						//深拷贝对象
						let temp = Object.assign({}, preState.books);
						temp[eachBook.shelf].push(eachBook);
						//更新state
						return {books: temp};
					} else {
						//如果当前标签没有被创建，就新建一个数组再Push
						//深拷贝对象
						let temp = Object.assign({}, preState.books);
						temp[eachBook.shelf] = [eachBook];
						//更新state
						return {books: temp};
					}
				})
				return null;
			})
		})
	}


	render() {
		let content = [];
		let count = 0;
		for (let shelf of Object.keys(this.state.books)) {
			// content.push(<BookShelf books=/>);
			content.push(<BookShelf books={this.state.books[shelf]} key={count} shelf={shelf}/>);
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
			</div>
		)
	}
}


//书架组件
class BookShelf extends React.Component {

	render() {
		return (
			<div className="bookshelf">
			  <h2 className="bookshelf-title">{this.props.shelf}</h2>
			  <div className="bookshelf-books">
				<ol className="books-grid">
				{this.props.books.map(book => (
				 	<li key={book.id}><Book detail={book}/></li>
				))}
				</ol>
			  </div>
			</div>
		)
	}
}



//每本书的组件
function Book(props) {
	return (
		<div className="book">
		  <div className="book-top">
			<div className="book-cover" style={{ width: 128, height: 193, backgroundImage: `url(${props.detail.imageLinks.thumbnail})` }}></div>
			<div className="book-shelf-changer">
			  <select>
				<option value="none" disabled>Move to...</option>
				<option value="currentlyReading">Currently Reading</option>
				<option value="wantToRead">Want to Read</option>
				<option value="read">Read</option>
				<option value="none">None</option>
			  </select>
			</div>
		  </div>
		  <div className="book-title">{props.detail.title}</div>
		  <div className="book-authors">{props.detail.authors['0']}</div>
		</div>
	)
}


export default BooksApp
