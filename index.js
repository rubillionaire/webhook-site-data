module.exports = SiteData;

/**
 * Get the data for a webhook site.
 * The Firebase path is /buckets/{site-name}/{site-key}/dev
 *
 * opts.firebase is required when intializing.
 * opts.siteName & opts.key are optional when intializing. These
 * values can be passed in as options to `get` and `set`.
 * 
 * @param {object}   opts
 * @param {object}   opts.firebase  Root Firebase database instances
 * @param {string}   opts.siteName  The name of the webhook site
 * @param {string}   opts.key       The key of the webhook site
 * @param {Function} callback       Function called with the site data
 */
function SiteData ( opts ) {
  if ( ! ( this instanceof SiteData ) ) return new SiteData( opts )
  if ( !opts ) opts = {}

  var firebaseRoot = options.firebse;

  if ( ! firebaseRoot ) throw new Error( 'SiteData opts expects an authorized firebase instance.' )

  return {
    get: getFirebaseData,
    set: setFirebaseData,
  }

  function getFirebaseData ( getOpts, callback ) {
    if ( typeof getOpts === 'function' ) {
      callback = getOpts;
      getOpts = Object.assign( {}, opts );
    }

    if ( ! getOpts.key ) return getSiteKey( getOpts, executeGet )

    return executeGet()

    function executeGet () {
      siteDataRef( getOpts ).once( 'value', onValue, onError )
    }

    function onValue ( snapshot ) { callback( null, snapshot.val() ) }
    function onError ( error ) { callback( error ) }
  }

  function setFirebaseData ( siteData, setOpts, callback ) {
    if ( typeof setOpts === 'function' ) {
      callback = setOpts;
      setOpts = Object.assign( {}, opts )
    }

    if ( ! setOpts.key ) return getSiteKey( setOpts, executeSet )

    return executeSet()
    
    function executeSet () {
      siteDataRef( setOpts ).set( siteData, callback )
    }
  }

  function siteDataRef ( siteOpts ) {
    return firebaseRoot.ref( 'buckets' )
      .child( escapeSiteName( siteOpts.siteName ) )
      .child( siteOpts.key )
      .child( 'dev' );
  }

  function getSiteKey ( keyOpts, callback ) {
    firebaseRoot.ref( 'management/sites' )
      .child( escapeSiteName( keyOpts.siteName ) )
      .child( 'key' )
      .once( 'value', siteKeySnapshotHandler, siteKeyErrorHandler )

    function siteKeySnapshotHandler ( siteKeySnapshot ) {
      var siteKey = siteKeySnapshot.val()
      Object.assign( keyOpts, { key: siteKey } )
      return continuationFn( null, keyOpts )
    }

    function siteKeyErrorHandler ( error ) {
      return callback( error )
    }
  }
}

function escapeSiteName ( siteName ) {
  return siteName.replace( /\./g, ',1' )
}
