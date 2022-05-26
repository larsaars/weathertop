const dataStore = require('./data-store');
const logger = require('../utils/logger');
const readingsStore = require('./readings-store');

const stationsStore = {
    async getStationData(email, stationId = null) {
        // query all stations belonging to current user
        // with most current readings
        // evaluates to for example to:
        //time	location	latitude	longitude	weather	temperature	wind_speed	wind_direction air_pressure
        // 2020-01-01 00:00:00	Berlin	52.5200000	13.4050000	0	0	0	0    0
        // 2020-01-01 00:00:03	Hamburg	52.5200000	13.4050000	0	7	0	0    0

        // query from all stations belonging to current user
        // the max and min values for parameters
        // temperature, wind speed, air pressure
        // evaluates to for example to :
        //station_id	min_temp	max_temp	min_wind	max_wind	min_pressure	max_pressure
        // 1	0	0	0	0	0	0
        // 2	0	7	0	0	0	0

        // join the two queries above
        // resulting in for example :
        //time	location	latitude	longitude	weather	temperature	wind_speed	wind_direction	air_pressure	min_temp	max_temp	min_wind	max_wind	min_pressure	max_pressure
        // 2020-01-01 00:00:00	Berlin	52.5200000	13.4050000	0	0	0	0	0	0	0	0	0	0	0
        // 2020-01-01 00:00:03	Hamburg	52.5200000	13.4050000	0	7	0	0	0	0	7	0	0	0	0

        // if stationId is not null, only return the station with the given id
        // (augment the query above with the station_id)

        // finds only stations with readings, so when creating a new station
        // always add a dummy reading

        const stationQueryPart = stationId ? 'and s.id=$2\n' : '\n';
        const stationsWithMaxMinValuesAndLatestReadings = await dataStore.query(
            'select \n' +
            's.id as station_id, r.time, s.location, s.latitude, s.longitude, r.weather, r.temperature, r.wind_speed, r.wind_direction, r.air_pressure,\n' +
            'sc.min_temp, sc.max_temp, sc.min_wind, sc.max_wind, sc.min_pressure, sc.max_pressure\n' +
            'from stations as s\n' +
            'join readings as r on s.id = r.station_id\n' +
            '-- join with query of min/max values\n' +
            'join\n' +
            '(select sr.station_id,\n' +
            'min(sr.temperature) as min_temp, max(sr.temperature) as max_temp,\n' +
            'min(sr.wind_speed) as min_wind, max(sr.wind_speed) as max_wind,\n' +
            'min(sr.air_pressure) as min_pressure, max(sr.air_pressure) as max_pressure\n' +
            'from stations as ss\n' +
            'join readings as sr on ss.id = sr.station_id\n' +
            'where ss.email=$1\n' +
            'group by sr.station_id) as sc\n' +
            'on sc.station_id = r.station_id\n' +
            '-- end of join\n' +
            'where s.email=$1\n' +
            stationQueryPart +
            'and r.time=\n' +
            '(select max(time)\n' +
            'from readings r2\n' +
            'where r.station_id=r2.station_id)',
            stationId ? [email, stationId] : [email],
            'error fetching all stations and its data'
        );

        return stationsWithMaxMinValuesAndLatestReadings.rows;
    },
    async createStation(email, station) {
        // returns true if everything went well
        try {
            // create station
            const stationId = await dataStore.query(
                'insert into stations (email, location, latitude, longitude) values ($1, $2, $3, $4) returning id',
                [email, station.location, Number(station.latitude), Number(station.longitude)],
                'error creating station'
            );
            // create dummy reading with id 1
            return await readingsStore.addDummyReading(email, stationId.rows[0].id);
        } catch (e) {
            return false;
        }
    },
    async deleteStation(stationId) {
        await dataStore.query(
            'delete from stations where id=$1',
            [stationId],
            'error deleting station'
        );
    },
    async getStationLatLngById(stationId) {
        const station = await dataStore.query(
            'select latitude, longitude from stations where id=$1',
            [stationId],
            'error fetching station lat/lng'
        );
        return station.rows[0];
    }
};

module.exports = stationsStore;