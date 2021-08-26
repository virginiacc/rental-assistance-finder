import Analytics from './Analytics.js';
import i18n from './translations/i18n.js';
const programsURL = 'https://files.consumerfinance.gov/a/assets/raf/raf.json';
import counties from './data/counties.json';

export const onlyUnique = ( value, index, self ) => {
  return self.indexOf( value ) === index;
}

export const sortGeographic = ( a, b ) => {
  return a.type.localeCompare( b.type ) || 
         a.name.localeCompare( b.name );
}

export const sortStatePrograms = ( programs ) => {
  return programs.sort( sortGeographic );
}

export const generateTribalOptions = data => {
  return data.map( item => ( item.name ) ).sort();
}

export const filterGeographicPrograms = ( programs, state, tribe ) => {
  if ( state ) {
    let filtered = programs.filter(
      item => ( item.state === state )
    );
    return sortStatePrograms( filtered );
  } else if ( tribe ) {
    return [];
  } else {
    return programs;
  }
}

export const filterTribalPrograms = ( programs, state, tribe ) => {
  if ( tribe ) {
    return programs.filter( 
      item => ( item.name === tribe )
    )
  } else if ( state ) {
    return [];
  } else {
    return programs;
  }
}

export const generateCountyOptions = ( state ) => {
  let vals = counties[state];
  return vals.map( 
    item => ( item + ' County' )
  )
}

export const filterProgramsByCounty = ( programs, county ) => {
  return programs.filter( item => ( 
      ( item.type === 'State' ) || 
      ( item.type === 'County' && 
        item.name === county ) ||
      ( item.type === 'City' && 
        item.county && 
        item.county.indexOf( county ) !== -1 ) 
    )
  )
}

export const getGeographicData = ( programs, state, county, tribe ) => {
  let geographic = filterGeographicPrograms( programs, state, tribe );
  let countyOptions = [];

  if ( state && geographic.length > 1 ) {
    countyOptions = generateCountyOptions( state );
  }

  if ( county ) {
    geographic = filterProgramsByCounty( geographic, county );
  }

  return [ geographic, countyOptions ];
}

export const fetchPrograms = () => {
  return fetch( 
    programsURL 
  ).then( 
    response => {
      if ( response.ok ) {
        return response.json();
      } else {
        throw new Error('Data load failure.')
      }
    }).then( data => {
      if ( data.geographic && data.tribal ) {
        return data;
      } else {
        throw new Error('Incorrect data format.')
      }
    });
}

export const sendAnalyticsEvent = ( action, label ) => {
  Analytics.sendEvent( Analytics.getDataLayerOptions( action, label ) );
}
