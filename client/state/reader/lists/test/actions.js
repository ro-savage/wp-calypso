/**
 * External dependencies
 */
import { nock, useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	READER_LIST_REQUEST,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_FOLLOW,
	READER_LISTS_UNFOLLOW
} from 'state/action-types';
import {
	receiveLists,
	requestList,
	requestSubscribedLists,
	followList,
	unfollowList
} from '../actions';

describe( 'actions', () => {
	useNock();

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveLists()', () => {
		it( 'should return an action object', () => {
			const lists = [ { ID: 841, title: 'Hello World', slug: 'hello-world' } ];
			const action = receiveLists( lists );

			expect( action ).to.eql( {
				type: READER_LISTS_RECEIVE,
				lists
			} );
		} );
	} );

	describe( '#requestList()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.2/read/lists/listowner/listslug' )
				.reply( 200, {
					list: {
						ID: 123,
						title: 'My test list'
					}
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestList()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LIST_REQUEST
			} );
		} );
	} );

	describe( '#requestSubscribedLists()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.2/read/lists' )
				.reply( 200, {
					found: 2,
					lists: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Mango & Feijoa' }
					]
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestSubscribedLists()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LISTS_REQUEST
			} );
		} );

		it( 'should dispatch lists receive action when request completes', () => {
			return requestSubscribedLists()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: READER_LISTS_RECEIVE,
					lists: [
						{ ID: 841, title: 'Hello World' },
						{ ID: 413, title: 'Mango & Feijoa' }
					]
				} );
			} );
		} );
	} );

	describe( '#followList()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.2/read/lists/restapitests/testlist/follow' )
				.reply( 200, {
					following: true
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			followList( 'restapitests', 'testlist' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LISTS_FOLLOW,
				owner: 'restapitests',
				slug: 'testlist'
			} );
		} );
	} );

	describe( '#unfollowList()', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.2/read/lists/restapitests/testlist/unfollow' )
				.reply( 200, {
					following: false
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			unfollowList( 'restapitests', 'testlist' )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: READER_LISTS_UNFOLLOW,
				owner: 'restapitests',
				slug: 'testlist'
			} );
		} );
	} );
} );
