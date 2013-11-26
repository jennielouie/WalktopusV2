class CreateWalks < ActiveRecord::Migration
  def change
    create_table :walks do |t|
      t.text :start
      t.text :end
      t.integer :markerInterval
      t.timestamps
    end
  end
end
