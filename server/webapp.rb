require 'rubygems'
require 'sinatra'
require 'mongo'
require 'json/pure'
require 'pry'

set :public_folder, '../public'

get "/" do
  redirect '/index.html'
end

# connecting to the database
client = Mongo::Connection.new # defaults to localhost:27017
db     = client['mydb']
coll   = db['koniky']

get '/koniky' do      
  koniky = coll.find({"loc" => 
    {"$geoWithin" => 
      {  
        "$geometry" => 
        { "type" => "Polygon", 
          "coordinates" => [[[params["swlo"].to_f,params["nela"].to_f],
                             [params["nelo"].to_f,params["nela"].to_f],
                             [params["nelo"].to_f,params["swla"].to_f],
                             [params["swlo"].to_f,params["swla"].to_f],
                             [params["swlo"].to_f,params["nela"].to_f]]]
        }
      }
    }
  })
  content_type "application/json"
  #koniky.to_json # require 'json/ext'
  JSON.pretty_generate(koniky.to_a)
end

# get the specified konik
get '/koniky/:id' do
  content_type :json
  konik = coll.find(:_id => BSON::ObjectId.from_string(params[:id]))
  content_type "application/json"
  JSON.pretty_generate(konik.to_a)
end

## Find documents up to 500m far away from the Point  
# get '/koniky' do      
#   koniky = coll.find({"loc" => 
#     {"$near" => 
#       {  
#         "$geometry" => 
#         { "type" => "Point", 
#           "coordinates" => [params["lon"].to_f,params["lat"].to_f]
#         },
#         "$maxDistance" => 500
#       }
#     }
#   })
#   content_type "application/json"
#   #koniky.to_json # require 'json/ext'
#   JSON.pretty_generate(koniky.to_a)
# end

# insert a new document from the request parameters,
# then return the full document
post '/new_konik/?' do
  # request.body.rewind
#   content_type :json
#   new_id = coll.insert JSON.parse request.body.read
  new_konik = params.clone
  new_konik.delete("street_number")
  new_konik.delete("autocomplete")
  new_konik.delete("longitude")
  new_konik.delete("latitude")
  new_konik["loc"] = {"type"=>"Point", "coordinates"=>[params["longitude"].to_f,params["latitude"].to_f]}
  new_id = coll.insert new_konik
end

# delete the specified konik and return success
delete '/koniky/:id' do
  content_type :json
  coll.remove(:_id => BSON::ObjectId.from_string(params[:id]))
  {:success => true}.to_json
end