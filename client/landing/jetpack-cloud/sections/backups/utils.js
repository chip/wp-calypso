/**
 * External dependencies
 */
import moment from 'moment';

/**
 * if the activityDateString is on the same date as we are looking at
 *
 * @param {string} activityDateString date string from activity log in ISO 8601 format
 * @param {string} targetDateString date that we want log items for in ISO 8601 format
 * @returns {boolean} if the given activityDateString
 */
export const isActivityItemDateEqual = ( activityDateString, targetDateString ) =>
	moment.parseZone( targetDateString ).isSame( moment.parseZone( activityDateString ), 'day' );

/**
 * filters the given activity logs into complete and error items from the given date
 *
 * @param {Array} logs an array of logs from the ActivityLog
 * @param {string} targetDateString date that we want log items for in ISO 8601 format
 * @returns {object} backup items for the day, sorted into complete backups for the day and errors
 */
export const getBackupAttemptsForDate = ( logs, targetDateString ) => ( {
	complete: logs.filter(
		item =>
			'rewind__backup_complete_full' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, targetDateString )
	),
	error: logs.filter(
		item =>
			'rewind__backup_error' === item.activityName &&
			isActivityItemDateEqual( item.activityDate, targetDateString )
	),
} );

export const getChangesInRange = ( logs, t1, t2 ) => {
	return logs.filter( event => {
		const eventTime = new Date( event.activityDate ).getTime();
		return eventTime > t1 && eventTime < t2;
	} );
};

export const getEventsInDailyBackup = ( logs, date ) => {
	const d = new Date( date );
	d.setDate( d.getDate() - 1 );
	const d1 = d.toISOString().split( 'T' )[ 0 ];
	const d2 = new Date( date ).toISOString().split( 'T' )[ 0 ];
	const lastBackup = getBackupAttemptsForDate( logs, d1 );
	const thisBackup = getBackupAttemptsForDate( logs, d2 );

	if ( ! ( lastBackup.complete.length && thisBackup.complete.length ) ) {
		return [];
	}

	const lastBackupDate = new Date( lastBackup.complete[ 0 ].activityDate );
	const thisBackupDate = new Date( thisBackup.complete[ 0 ].activityDate );
	const lastBackupTime = lastBackupDate.getTime();
	const thisBackupTime = thisBackupDate.getTime();

	return getChangesInRange( logs, lastBackupTime, thisBackupTime );
};

export const metaStringToObject = metaString => {
	// Yes, this is horrible, but we will soon build an API that does this much better
	const meta = metaString.split( ', ' ).map( item => {
		const sp = item.split( ' ' );
		return { key: sp[ 1 ], val: sp[ 0 ] };
	} );

	return {
		plugins: meta.find( obj => 'plugins' === obj.key || 'plugin' === obj.key ),
		themes: meta.find( obj => 'themes' === obj.key || 'theme' === obj.key ),
		uploads: meta.find( obj => 'uploads' === obj.key || 'upload' === obj.key ),
		posts: meta.find( obj => 'posts' === obj.key || 'post' === obj.key ),
	};
};

export const getMetaDiffForDailyBackup = ( logs, date ) => {
	const d = new Date( date );
	d.setDate( d.getDate() - 1 );
	const d1 = d.toISOString().split( 'T' )[ 0 ];
	const d2 = new Date( date ).toISOString().split( 'T' )[ 0 ];
	const lastBackup = getBackupAttemptsForDate( logs, d1 );
	const thisBackup = getBackupAttemptsForDate( logs, d2 );

	if ( ! ( lastBackup.complete.length && thisBackup.complete.length ) ) {
		return [];
	}

	const thisMeta = metaStringToObject(
		thisBackup.complete[ 0 ].activityDescription[ 2 ].children[ 0 ]
	);

	const lastMeta = metaStringToObject(
		lastBackup.complete[ 0 ].activityDescription[ 2 ].children[ 0 ]
	);

	return [
		{ type: 'Plugin', num: thisMeta.plugins.val - lastMeta.plugins.val },
		{ type: 'Theme', num: thisMeta.themes.val - lastMeta.themes.val },
		{ type: 'Upload', num: thisMeta.uploads.val - lastMeta.uploads.val },
		{ type: 'Post', num: thisMeta.posts.val - lastMeta.posts.val },
	];
};

export const getDailyBackupDeltas = ( logs, date ) => {
	const changes = getEventsInDailyBackup( logs, date );

	return {
		mediaCreated: changes.filter( event => 'attachment__uploaded' === event.activityName ),
		mediaDeleted: changes.filter( event => 'attachment__deleted' === event.activityName ),
		posts: changes.filter(
			event => 'post__published' === event.activityName || 'post__trashed' === event.activityName
		),
		postsCreated: changes.filter( event => 'post__published' === event.activityName ),
		postsDeleted: changes.filter( event => 'post__trashed' === event.activityName ),
		plugins: changes.filter(
			event =>
				'plugin__installed' === event.activityName || 'plugin__deleted' === event.activityName
		),
		themes: changes.filter(
			event => 'theme__installed' === event.activityName || 'theme__deleted' === event.activityName
		),
	};
};
