-- clear complete database
drop table users, stations, readings;

-- create tables

create table if not exists users (
    email varchar(255) not null check(email <> '') check(email like '%@%') primary key,
    password varchar(255) not null check(password <> '') check(length(password) > 5),  -- store raw password, not hashed (not in assignment)
    first_name varchar(255) not null check(first_name <> '') check(length(first_name) > 2),
    last_name varchar(255) not null check(last_name <> '') check(length(last_name) > 2)
);

create table if not exists stations (
    id serial primary key,
    location varchar(255) not null check(location <> '') check(length(location) > 2),
    latitude decimal(10,7) not null check(latitude > -90 and latitude < 90),
    longitude decimal(10,7) not null check(longitude > -180 and longitude < 180),
    email varchar(255) references users(email) on delete cascade
);

create table if not exists readings (
    id serial primary key,
    time timestamp not null,
    station_id integer references stations(id) on delete cascade,
    email varchar(255) references users(email) on delete cascade,  -- owner of reading
    weather int not null,
    temperature float not null check(temperature > -273.15),
    air_pressure float not null check(air_pressure >= 0),
    wind_speed float not null check(wind_speed >= 0),
    wind_direction float not null check(wind_direction between 0 and 360)
);

-- insert values into tables

insert into users(email, password, first_name, last_name)
values ('lars.lars.specht@gmail.com', '123456', 'Lars', 'Specht');

insert into stations(location, latitude, longitude, email)
values ('Berlin', 52.5200, 13.4050, 'lars.lars.specht@gmail.com');

insert into stations(location, latitude, longitude, email)
values ('Hamburg',52.5200, 13.4050, 'lars.lars.specht@gmail.com');

insert into stations(location, latitude, longitude, email)
values ('Munich', 52.5200, 13.4050, 'lars.lars.specht@gmail.com');

insert into readings(time, station_id, email, weather, temperature, air_pressure, wind_speed, wind_direction)
values ('2020-01-01 00:00:00', 1, 'lars.lars.specht@gmail.com', 0, 0, 0, 0, 0);

insert into readings(time, station_id, email, weather, temperature, air_pressure, wind_speed, wind_direction)
values ('2020-01-01 00:00:01', 2, 'lars.lars.specht@gmail.com', 0, 0, 0, 0, 0);

insert into readings(time, station_id, email, weather, temperature, air_pressure, wind_speed, wind_direction)
values ('2020-01-01 00:00:02', 2, 'lars.lars.specht@gmail.com', 0, 0, 0, 0, 0);

insert into readings(time, station_id, email, weather, temperature, air_pressure, wind_speed, wind_direction)
values ('2020-01-01 00:00:03', 2, 'lars.lars.specht@gmail.com', 0, 7, 0, 0, 0);