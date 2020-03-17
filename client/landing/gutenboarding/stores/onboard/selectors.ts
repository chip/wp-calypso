/**
 * Internal dependencies
 */
import { State } from './reducer';

export const getState = ( state: State ) => state;

export const getLastCreatedSite = ( state: State ) => state.lastCreatedSite;

/**
 * Indicates whether the last created site is still current based on
 * whether is was created within a window defined by the `minutes` parameter.
 *
 * @param {State} state		Global state tree
 * @param {number} minutes	Number of minutes within which a site is considered recent
 * @returns {boolean}		true if activity is in progress
 */
export const wasLastSiteCreatedRecently = ( state: State, minutes = 60 ): boolean => {
	if ( state.lastCreatedSite?.createdTimestamp ) {
		return Date.now() - state.lastCreatedSite.createdTimestamp < 1000 * 60 * minutes;
	}
	return false;
};
