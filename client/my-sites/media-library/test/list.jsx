/**
 * External dependencies
 */
import { expect } from 'chai';
import React from 'react';
import toArray from 'lodash/toArray';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useMockery from 'test/helpers/use-mockery';

/**
 * Module variables
 */
const DUMMY_SITE_ID = 2916284;
const EMPTY_COMPONENT = React.createClass( {
	render: function() {
		return <div />;
	}
} );

describe( 'MediaLibraryList item selection', function() {
	let mount, MediaLibrarySelectedData, MediaLibrarySelectedStore,
		MediaActions, fixtures, Dispatcher, MediaList, wrapper, mediaList;

	useFakeDom();
	useMockery();

	function toggleItem( itemIndex, shiftClick ) {
		mediaList.toggleItem( fixtures.media[ itemIndex ], shiftClick );
	}

	function expectSelectedItems() {
		expect( MediaLibrarySelectedStore.getAll( DUMMY_SITE_ID ) ).to.have.members(
			toArray( arguments ).map( function( arg ) {
				return fixtures.media[ arg ];
			} )
		);
	}

	before( function() {
		mount = require( 'enzyme' ).mount;
		MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' );
		MediaLibrarySelectedStore = require( 'lib/media/library-selected-store' );
		MediaActions = require( 'lib/media/actions' );
		fixtures = require( './fixtures' );
		Dispatcher = require( 'dispatcher' );

		Dispatcher.handleServerAction( {
			type: 'RECEIVE_MEDIA_ITEMS',
			siteId: DUMMY_SITE_ID,
			data: fixtures
		} );

		mockery.registerMock( './list-item', EMPTY_COMPONENT );
		MediaList = require( '../list' );
	} );

	beforeEach( function() {
		MediaActions.setLibrarySelectedItems( DUMMY_SITE_ID, [] );

		if ( wrapper ) {
			wrapper.unmount();
		}
	} );

	context( 'multiple selection', function() {
		beforeEach( () => {
			wrapper = mount(
				<MediaLibrarySelectedData siteId={ DUMMY_SITE_ID }>
					<MediaList
						site={ { ID: DUMMY_SITE_ID } }
						media={ fixtures.media }
						mediaScale={ 0.24 } />
				</MediaLibrarySelectedData>
			);
			mediaList = wrapper.find( MediaList ).get( 0 );
		} );

		it( 'allows selecting single items', function() {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 2 );
			expectSelectedItems( 0, 2 );
		} );

		it( 'allows selecting multiple items at once by Shift+clicking', function() {
			toggleItem( 0 );
			toggleItem( 4, true ); // Shift+click to select items 0 through 4
			expectSelectedItems( 0, 1, 2, 3, 4 );
		} );

		it( 'allows selecting single and multiple items', function() {
			toggleItem( 1 );
			expectSelectedItems( 1 );
			toggleItem( 5 );
			toggleItem( 9, true );
			expectSelectedItems( 1, 5, 6, 7, 8, 9 );
		} );

		it( 'allows chaining Shift+click selections from first item', function() {
			toggleItem( 0 );
			toggleItem( 3, true );
			expectSelectedItems( 0, 1, 2, 3 );
			toggleItem( 6, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5, 6 );
		} );

		it( 'allows chaining Shift+click selections to last item', function() {
			toggleItem( 3 );
			toggleItem( 6, true );
			expectSelectedItems( 3, 4, 5, 6 );
			toggleItem( 9, true );
			expectSelectedItems( 3, 4, 5, 6, 7, 8, 9 );
		} );

		it( 'allows chaining Shift+click deselections', function() {
			// first select all items
			toggleItem( 0 );
			toggleItem( 9, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 );
			toggleItem( 1 );
			expectSelectedItems( 0, 2, 3, 4, 5, 6, 7, 8, 9 );
			toggleItem( 4, true );
			expectSelectedItems( 0, 5, 6, 7, 8, 9 );
			toggleItem( 7, true );
			expectSelectedItems( 0, 8, 9 );
		} );

		it( 'allows selecting then deselecting multiple items', function() {
			toggleItem( 1 );
			toggleItem( 6, true );
			expectSelectedItems( 1, 2, 3, 4, 5, 6 );
			toggleItem( 1, true );
			expectSelectedItems();
		} );

		it( 'selects the previously and currently clicked items when Shift+clicking', function() {
			toggleItem( 1 );
			toggleItem( 4, true );
			expectSelectedItems( 1, 2, 3, 4 );
			toggleItem( 5 );
			toggleItem( 0, true );
			expectSelectedItems( 0, 1, 2, 3, 4, 5 );
		} );
	} );

	context( 'single selection', function() {
		beforeEach( () => {
			wrapper = mount(
				<MediaLibrarySelectedData siteId={ DUMMY_SITE_ID }>
					<MediaList
						site={ { ID: DUMMY_SITE_ID } }
						media={ fixtures.media }
						mediaScale={ 0.24 }
						single />
				</MediaLibrarySelectedData>
			);
			mediaList = wrapper.find( MediaList ).get( 0 );
		} );

		it( 'allows selecting a single item', function() {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 2 );
			expectSelectedItems( 2 );
		} );

		it( 'allows deselecting a single item', function() {
			toggleItem( 0 );
			expectSelectedItems( 0 );
			toggleItem( 0 );
			expectSelectedItems();
		} );

		it( 'only selects a single item when selecting multiple via Shift+click', function() {
			toggleItem( 0 );
			toggleItem( 4, true ); // Shift+click to select items 0 through 4
			expectSelectedItems( 4 );
		} );
	} );
} );
