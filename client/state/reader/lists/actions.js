/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_LIST_REQUEST,
	READER_LIST_REQUEST_SUCCESS,
	READER_LIST_REQUEST_FAILURE,
	READER_LISTS_RECEIVE,
	READER_LISTS_REQUEST,
	READER_LISTS_REQUEST_SUCCESS,
	READER_LISTS_REQUEST_FAILURE,
	READER_LISTS_FOLLOW,
	READER_LISTS_FOLLOW_SUCCESS,
	READER_LISTS_FOLLOW_FAILURE,
	READER_LISTS_UNFOLLOW,
	READER_LISTS_UNFOLLOW_SUCCESS,
	READER_LISTS_UNFOLLOW_FAILURE,
} from 'state/action-types';

/**
 * Returns an action object to signal that list objects have been received.
 *
 * @param  {Array}  lists Lists received
 * @return {Object}       Action object
 */
export function receiveLists( lists ) {
	return {
		type: READER_LISTS_RECEIVE,
		lists
	};
}

/**
 * Triggers a network request to fetch the current user's lists.
 *
 * @return {Function}        Action thunk
 */
export function requestSubscribedLists() {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_REQUEST,
		} );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readLists( ( error, data ) => {
				if ( error ) {
					dispatch( {
						type: READER_LISTS_REQUEST_FAILURE,
						error
					} );
					reject();
				} else {
					dispatch( receiveLists( data.lists ) );
					dispatch( {
						type: READER_LISTS_REQUEST_SUCCESS,
						data
					} );
					resolve();
				}
			} );
		} );
	};
}

/**
 * Triggers a network request to fetch a single Reader list.
 *
 * @param  {String}  owner List owner
 * @param  {String}  slug List slug
 * @return {Function}        Action thunk
 */
export function requestList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LIST_REQUEST,
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().readList( query, ( error, data ) => {
				if ( error ) {
					dispatch( {
						type: READER_LIST_REQUEST_FAILURE,
						error
					} );
					reject();
				} else {
					dispatch( {
						type: READER_LIST_REQUEST_SUCCESS,
						data
					} );
					resolve();
				}
			} );
		} );
	};
}

/**
 * Triggers a network request to follow a list.
 *
 * @param  {String}  owner List owner
 * @param  {String}  slug List slug
 * @return {Function} Action promise
 */
export function followList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_FOLLOW,
			owner,
			slug
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().followList( query, ( error, data ) => {
				if ( error || ! ( data && data.following ) ) {
					dispatch( {
						type: READER_LISTS_FOLLOW_FAILURE,
						owner,
						slug,
						error
					} );
					reject();
				} else {
					dispatch( receiveLists( [ data.list ] ) );
					dispatch( {
						type: READER_LISTS_FOLLOW_SUCCESS,
						owner,
						slug,
						data
					} );
					resolve();
				}
			} );
		} );
	};
}

/**
 * Triggers a network request to unfollow a list.
 *
 * @param  {String}  owner List owner
 * @param  {String}  slug List slug
 * @return {Function} Action promise
 */
export function unfollowList( owner, slug ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_LISTS_UNFOLLOW,
			owner,
			slug
		} );

		const query = createQuery( owner, slug );

		return new Promise( ( resolve, reject ) => {
			wpcom.undocumented().unfollowList( query, ( error, data ) => {
				if ( error || ! ( data && ! data.following ) ) {
					dispatch( {
						type: READER_LISTS_UNFOLLOW_FAILURE,
						owner,
						slug,
						error
					} );
					reject();
				} else {
					dispatch( {
						type: READER_LISTS_UNFOLLOW_SUCCESS,
						owner,
						slug,
						data
					} );
					resolve();
				}
			} );
		} );
	};
}

function createQuery( owner, slug ) {
	const preparedOwner = decodeURIComponent( owner );
	const preparedSlug = decodeURIComponent( slug );
	return { owner: preparedOwner, slug: preparedSlug };
}
