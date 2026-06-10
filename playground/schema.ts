import {
  defineSchema,
  string, text, number, auto, timestamp,
  enumOf, hasMany, hasOne
} from '@yiyuan/core'

export default defineSchema({
  models: {
    Category: {
      id:    auto(),
      name:  string().required().searchable(),
      icon:  string(),
      items: hasMany('Dish'),
    },

    Dish: {
      id:          auto(),
      name:        string().required().searchable(),
      description: text(),
      price:       number().required(),
      category:    hasOne('Category'),
      available:   enumOf('yes', 'no').default('yes'),
      createdAt:   timestamp(),
    },

    Table: {
      id:     auto(),
      number: number().required().unique(),
      seats:  number().default(4),
      status: enumOf('free', 'occupied', 'reserved').default('free'),
      orders: hasMany('Order'),
    },

    Order: {
      id:        auto(),
      table:     hasOne('Table'),
      items:     text(),
      total:     number(),
      status:    enumOf('pending', 'cooking', 'served', 'paid').default('pending'),
      createdAt: timestamp(),
    },
  },
})
