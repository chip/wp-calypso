/**
 * Internal Dependencies
 */
import { EXPERIMENT_FETCH, EXPERIMENT_ASSIGN } from 'state/action-types';
import 'state/data-layer/wpcom/sites/active-experiments';

export const assignToExperiments = ( experiments: { tests: object; nextRefresh: number } ) => ( {
	type: EXPERIMENT_ASSIGN,
	...experiments,
} );

// todo: handle TTL
export const fetchExperiments = ( anonId: string ) => ( {
	type: EXPERIMENT_FETCH,
	anonId,
} );