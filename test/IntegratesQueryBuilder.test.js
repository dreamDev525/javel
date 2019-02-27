import test from 'ava'
import {host, stubs} from './helpers'
import { HasAttributes, MakesRequests } from '@'
import IntegratesQueryBuilder from '@/IntegratesQueryBuilder'
const { Article } = stubs.withMixins(HasAttributes, MakesRequests, IntegratesQueryBuilder)
import nock from 'nock'
import Javel from '@/Javel'
import * as MockJsQueryBuilder from './helpers/mock-js-query-builder';

test('It throws an error if "js-query-builder" is not installed', t => {
    t.throws(Article.query, Error)
})

test('It returns QueryBuilder instance on *query()* method call', t => {
    Javel.registerOptionalModule('js-query-builder', MockJsQueryBuilder)

    t.true(Article.query() instanceof MockJsQueryBuilder.QueryBuilder)

    Javel.forgetOptionalModules()
})

test('It returns proper results on *get()* method call', async t => {
    Javel.registerOptionalModule('js-query-builder', MockJsQueryBuilder)

    nock(host)
        .get('/api/article?sort=-id')
        .reply(200, [
            { id: 3, name: 'My blog post part 3' },
            { id: 2, name: 'My blog post part 2' },
            { id: 1, name: 'My blog post part 1' },
        ])

    const articles = await Article.query().foo().bar().built('?sort=-id').get()

    t.is(articles.length, 3)
    t.is(articles[0].name, 'My blog post part 3')
    t.is(articles[1].name, 'My blog post part 2')
    t.is(articles[2].name, 'My blog post part 1')
    articles.forEach(article => t.true(article instanceof Article))
    t.true(nock.isDone())

    Javel.forgetOptionalModules()
})
