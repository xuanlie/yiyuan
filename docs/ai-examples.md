# 对话示例

## 用户：我要一个餐厅点餐系统

分析：需要菜品分类、菜品、桌位、订单。

Category 1:N Dish（分类有多个菜品）
Table 1:N Order（桌位有多个订单）

import {
  defineSchema,
  string, text, number, auto, timestamp,
  enumOf, hasOne, hasMany
} from '@yiyuan/core'

export default defineSchema({
  models: {
    Category: {
      id:    auto(),
      name:  string().required().searchable(),
      items: hasMany('Dish'),
    },
    Dish: {
      id:        auto(),
      name:      string().required().searchable(),
      price:     number().required(),
      category:  hasOne('Category'),
      available: enumOf('yes', 'no').default('yes'),
      createdAt: timestamp(),
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

运行：yiyuan dev

---

## 用户：我要一个博客系统，支持评论

分析：需要作者、文章、评论。

Author 1:N Post
Post 1:N Comment

import {
  defineSchema,
  string, text, auto, timestamp,
  enumOf, hasOne, hasMany
} from '@yiyuan/core'

export default defineSchema({
  models: {
    Author: {
      id:    auto(),
      name:  string().required().searchable(),
      bio:   text(),
      posts: hasMany('Post'),
    },
    Post: {
      id:        auto(),
      title:     string().required().searchable(),
      content:   text(),
      tag:       enumOf('tech', 'life', 'design').default('tech'),
      status:    enumOf('draft', 'published').default('draft'),
      author:    hasOne('Author'),
      comments:  hasMany('Comment'),
      createdAt: timestamp(),
    },
    Comment: {
      id:        auto(),
      content:   text().required(),
      post:      hasOne('Post'),
      author:    string().required(),
      createdAt: timestamp(),
    },
  },
})

---

## 用户：我要一个任务管理，支持项目分组

分析：需要项目和任务。

Project 1:N Task

import {
  defineSchema,
  string, text, auto, timestamp,
  enumOf, hasMany
} from '@yiyuan/core'

export default defineSchema({
  models: {
    Project: {
      id:        auto(),
      name:      string().required().searchable(),
      desc:      text(),
      status:    enumOf('planning', 'active', 'done').default('planning'),
      tasks:     hasMany('Task'),
      createdAt: timestamp(),
    },
    Task: {
      id:          auto(),
      title:       string().required().searchable(),
      desc:        text(),
      status:      enumOf('todo', 'doing', 'done').default('todo'),
      priority:    enumOf('low', 'medium', 'high').default('medium'),
      createdAt:   timestamp(),
    },
  },
})
