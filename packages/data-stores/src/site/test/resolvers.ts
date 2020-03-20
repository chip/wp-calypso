/*
 * These tests shouldn't require the jsdom environment,
 * but we're waiting for this PR to merge:
 * https://github.com/WordPress/gutenberg/pull/20486
 *
 * @jest-environment jsdom
 */

/**
 * Internal dependencies
 */
import { createResolvers } from '../resolvers';

const { getSite } = createResolvers( { client_id: '', client_secret: '' } );

describe( 'getSite', () => {
	it( 'should return a receiveExistingSite action object on success', () => {
		const slug = 'mytestsite12345.wordpress.com';
		const apiResponse = {
			ID: 1,
			name: 'My test site',
			description: '',
			URL: 'http://mytestsite12345.wordpress.com',
		};

		const generator = getSite( slug );

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: `/sites/${ slug }`,
			} ),
		} );

		expect( generator.next( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_EXISTING_SITE',
			slug,
			response: apiResponse,
		} );

		expect( generator.next().done ).toBe( true );
	} );

	it( 'should return a receiveExistingSiteFailed action object on fail', () => {
		const slug = 'mytestsite12345.wordpress.com';
		const apiResponse = {
			status: 404,
			error: 'unknown_blog',
			message: 'Unknown blog',
		};

		const generator = getSite( slug );

		expect( generator.next().value ).toEqual( {
			type: 'WPCOM_REQUEST',
			request: expect.objectContaining( {
				path: `/sites/${ slug }`,
			} ),
		} );

		expect( generator.throw( apiResponse ).value ).toEqual( {
			type: 'RECEIVE_EXISTING_SITE_FAILED',
			slug,
			response: undefined,
		} );

		expect( generator.next().done ).toBe( true );
	} );
} );
