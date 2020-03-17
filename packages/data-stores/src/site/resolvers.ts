/**
 * Internal dependencies
 */
import { wpcomRequest } from '../wpcom-request-controls';
import { createActions } from './actions';
import { WpcomClientCredentials } from '../shared-types';

export function createResolvers( clientCreds: WpcomClientCredentials ) {
	const { receiveExistingSite, receiveExistingSiteFailed } = createActions( clientCreds );

	/**
	 * Attempt to find an existing site based on its domain, and if not return undefined.
	 * We are currently ignoring error messages and silently failing if we can't find an
	 * existing site. This could be extended in the future by retrieving the `error` and
	 * `message` strings returned by the API.
	 *
	 * @param slug {string}	The domain to search for
	 */
	function* getSite( slug: string ) {
		try {
			const existingSite = yield wpcomRequest( {
				path: '/sites/' + encodeURIComponent( slug ),
				apiVersion: '1.1',
			} );
			return receiveExistingSite( slug, existingSite );
		} catch ( err ) {
			return receiveExistingSiteFailed( slug, undefined );
		}
	}

	return {
		getSite,
	};
}
