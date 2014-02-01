require 'rubygems'
require 'sinatra'
require 'mongo'

# connecting to the database
client = Mongo::Connection.new # defaults to localhost:27017
db     = client['mydb']
coll   = db['koniky']

get '/hi' do
  "Hello World!"
  puts "There are #{coll.count} total horses. Here they are:"
  coll.find.each { |konik| puts konik.inspect }
end
