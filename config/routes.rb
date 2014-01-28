WalktopusV2::Application.routes.draw do

root :to => 'walks#new'
resources :walks
end
