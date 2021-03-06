/**
 * Internal dependencies
 */
import {
	CurrentUser,
	CreateAccountParams,
	NewUserErrorResponse,
	NewUserSuccessResponse,
} from './types';
import { wpcomRequest } from '../wpcom-request-controls';
import { WpcomClientCredentials } from '../shared-types';

export function createActions( clientCreds: WpcomClientCredentials ) {
	const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
		type: 'RECEIVE_CURRENT_USER' as const,
		currentUser,
	} );

	const receiveCurrentUserFailed = () => ( {
		type: 'RECEIVE_CURRENT_USER_FAILED' as const,
	} );

	const fetchNewUser = () => ( {
		type: 'FETCH_NEW_USER' as const,
	} );

	const receiveNewUser = ( response: NewUserSuccessResponse ) => ( {
		type: 'RECEIVE_NEW_USER' as const,
		response,
	} );

	const receiveNewUserFailed = ( error: NewUserErrorResponse ) => ( {
		type: 'RECEIVE_NEW_USER_FAILED' as const,
		error,
	} );

	function* createAccount( params: CreateAccountParams ) {
		yield fetchNewUser();
		try {
			const newUser = yield wpcomRequest( {
				body: {
					// defaults
					is_passwordless: true,
					signup_flow_name: 'gutenboarding',
					locale: 'en',

					...clientCreds,
					...params,

					// Set to false because account validation should be a separate action
					validate: false,
				},
				path: '/users/new',
				apiVersion: '1.1',
				method: 'post',
			} );
			return receiveNewUser( newUser );
		} catch ( err ) {
			yield receiveNewUserFailed( err );

			return false;
		}
	}

	return {
		receiveCurrentUser,
		receiveCurrentUserFailed,
		fetchNewUser,
		receiveNewUser,
		receiveNewUserFailed,
		createAccount,
	};
}

type ActionCreators = ReturnType< typeof createActions >;

export type Action = ReturnType<
	| ActionCreators[ 'receiveCurrentUser' ]
	| ActionCreators[ 'receiveCurrentUserFailed' ]
	| ActionCreators[ 'fetchNewUser' ]
	| ActionCreators[ 'receiveNewUser' ]
	| ActionCreators[ 'receiveNewUserFailed' ]
>;
