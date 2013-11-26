WalktopusV2::Application.routes.draw do
  # The priority is based upon order of creation:
  # first created -> highest priority.

root :to => 'walks#new'
resources :walks
end
