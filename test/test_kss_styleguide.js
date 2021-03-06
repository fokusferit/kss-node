/*global describe,context,it,before*/
/*eslint-disable max-nested-callbacks*/

'use strict';

var kss = require('../index.js'),
  testUtils = require('./testUtils');

describe('KssStyleguide object API', function() {
  before(function(done) {
    var self = this;
    testUtils.traverseFixtures({mask: /(sections\-queries|sections\-order|property\-styleguide\-word\-keys)\.less/}, function(styleguide) {
      self.styleguide = styleguide;
      testUtils.traverseFixtures({mask: /.*\-word\-phrases\.less/}, function(styleguideWordPhrases) {
        self.styleguideWordPhrases = styleguideWordPhrases;
        done();
      });
    });
  });

  /*eslint-disable guard-for-in,no-loop-func*/
  [
    'init',
    'section',
    'sortSections',
    'getWeight'
  ].forEach(function(method) {
    it('has ' + method + '() method', function() {
      (new kss.KssStyleguide({})).should.have.method(method);
    });
  });
  /*eslint-enable guard-for-in,no-loop-func*/

  describe('.section()', function() {

    context('given no arguments', function() {
      it('should return only referenced sections', function(done) {
        this.styleguide.section().map(function(section) {
          section.data.should.have.property('reference');
        });
        done();
      });

      it('should return all referenced sections', function(done) {
        var results = [],
          expected = [
            '4', '4.1',
            '4.1.1', '4.1.1.1', '4.1.1.2',
            '4.1.2', '4.1.2.2',
            '8',
            '9', '9.1', '9.1.1', '9.2', '9.3', '9.4', '9.5', '9.10', '9.11', '9.100',
            'alpha', 'alpha.alpha', 'alpha.alpha.alpha', 'alpha.beta', 'alpha.delta', 'alpha.epsilon', 'alpha.gamma', 'alpha-bet',
            'WordKeys.Base.Link', 'WordKeys.Components', 'WordKeys.Components.Message', 'WordKeys.Components.Tabs', 'WordKeys.Forms.Button', 'WordKeys.Forms.Input'
          ];
        this.styleguide.section().map(function(section) {
          results.push(section.reference());
        });
        results.should.be.eql(expected);
        done();
      });
    });

    context('given exact references', function() {
      it('should find a reference with depth 1', function(done) {
        var section = this.styleguide.section('4');
        section.header().should.be.equal('DEPTH OF 1');
        section.depth().should.be.equal(1);
        section.reference().should.be.equal('4');
        done();
      });

      it('should find a reference with depth 3 and no modifiers', function(done) {
        var section = this.styleguide.section('4.1.1');
        section.header().should.be.equal('DEPTH OF 3, NO MODIFIERS');
        section.reference().should.be.equal('4.1.1');
        section.depth().should.be.equal(3);
        done();
      });

      it('should find a reference with depth 3 and modifiers', function(done) {
        var section = this.styleguide.section('4.1.2');
        section.header().should.be.equal('DEPTH OF 3, MODIFIERS');
        section.depth().should.be.equal(3);
        section.reference().should.be.equal('4.1.2');
        done();
      });

      it('should not find a reference with depth 3 that does not exist', function(done) {
        this.styleguide.section('4.1.3').should.be.false();
        done();
      });

      it('should find a reference with depth 4 (A)', function(done) {
        var section = this.styleguide.section('4.1.1.1');
        section.header().should.be.equal('DEPTH OF 4 (A)');
        section.depth().should.be.equal(4);
        section.reference().should.be.equal('4.1.1.1');
        done();
      });

      it('should find a reference with depth 4 (B)', function(done) {
        var section = this.styleguide.section('4.1.1.2');
        section.header().should.be.equal('DEPTH OF 4 (B)');
        section.depth().should.be.equal(4);
        section.reference().should.be.equal('4.1.1.2');
        done();
      });

      it('should find a reference with depth 4 (C)', function(done) {
        var section = this.styleguide.section('4.1.2.2');
        section.header().should.be.equal('DEPTH OF 4 (C)');
        section.depth().should.be.equal(4);
        section.reference().should.be.equal('4.1.2.2');
        done();
      });
    });

    context('given string queries', function() {
      it('should return 1 level of descendants when given "4.x"', function(done) {
        var sections = this.styleguide.section('4.x');
        sections.map(function(section) {
          section.reference().should.equal('4.1');
          section.header().should.equal('DEPTH OF 2');
        });
        sections.length.should.equal(1);
        done();
      });

      it('should return 1 level of descendants when given "4.1.x"', function(done) {
        var results,
          expected = ['4.1.1', '4.1.2'];
        results = this.styleguide.section('4.1.x').map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return 2 levels of descendants when given "4.x.x"', function(done) {
        var results,
          expected = ['4.1', '4.1.1', '4.1.2'];
        results = this.styleguide.section('4.x.x').map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return "4.1" and all levels of descendants when given "4.1.*"', function(done) {
        var results,
          expected = ['4.1', '4.1.1', '4.1.1.1', '4.1.1.2', '4.1.2', '4.1.2.2'];
        results = this.styleguide.section('4.1.*').map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should not find "alpha" section when given a query for "alp.*"', function(done) {
        this.styleguide.section('alp.*').should.be.Array();
        this.styleguide.section('alp.*').length.should.equal(0);
        done();
      });

      it('should not find "alpha" section when given a query for "alp.x"', function(done) {
        this.styleguide.section('alp.x').should.be.Array();
        this.styleguide.section('alp.x').length.should.equal(0);
        done();
      });

      it('should return numeric sections in order', function(done) {
        var results,
          expected = ['9.1', '9.2', '9.3', '9.4', '9.5', '9.10', '9.11', '9.100'];
        results = this.styleguide.section('9.x').map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return "word key" sections in order', function(done) {
        var results,
          expected = ['alpha.alpha', 'alpha.beta', 'alpha.delta', 'alpha.epsilon', 'alpha.gamma'];
        results = this.styleguide.section('alpha.x').map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return "word key" sections with dashes in the name', function(done) {
        var sections = this.styleguide.section('alpha-bet.*');
        sections.map(function(section) {
          section.reference().should.equal('alpha-bet');
        });
        sections.length.should.equal(1);
        done();
      });

      it('should return "word phrase" sections in order', function(done) {
        var results,
          expected = ['beta - alpha', 'beta - beta', 'beta - delta', 'beta - epsilon', 'beta - gamma'];
        results = this.styleguideWordPhrases.section('beta.x').map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });
    });

    context('given regex queries', function() {
      it('should return "4" and all levels of descendants when given /4.*/', function(done) {
        var results,
          expected = ['4', '4.1', '4.1.1', '4.1.1.1', '4.1.1.2', '4.1.2', '4.1.2.2'];
        results = this.styleguide.section(/4.*/).map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return "4" when given /4/', function(done) {
        var sections = this.styleguide.section(/4/);
        sections.map(function(section) {
          section.reference().should.equal('4');
        });
        sections.length.should.equal(1);
        done();
      });

      it('should return numeric sections in order', function(done) {
        var results,
          expected = ['9', '9.1', '9.1.1', '9.2', '9.3', '9.4', '9.5', '9.10', '9.11', '9.100'];
        results = this.styleguide.section(/9.*/).map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return "word key" sections in order', function(done) {
        var results,
          expected = ['alpha.alpha', 'alpha.alpha.alpha', 'alpha.beta', 'alpha.delta', 'alpha.epsilon', 'alpha.gamma'];
        results = this.styleguide.section(/alpha\..*/).map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return "word phrase" sections in order', function(done) {
        var results,
          expected = ['beta - alpha', 'beta - alpha - alpha', 'beta - beta', 'beta - delta', 'beta - epsilon', 'beta - gamma'];
        results = this.styleguideWordPhrases.section(/beta - .*/).map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return weighted "word phrase" sections in order', function(done) {
        var results,
          expected = ['gamma - alpha', 'gamma - alpha - delta', 'gamma - alpha - gamma', 'gamma - alpha - beta', 'gamma - alpha - alpha', 'gamma - beta', 'gamma - gamma', 'gamma - delta', 'gamma - epsilon'];
        results = this.styleguideWordPhrases.section(/gamma - .*/).map(function(section) {
          return section.reference();
        });
        results.should.eql(expected);
        done();
      });

      it('should return autoincrement values for "word phrase" sections in order', function(done) {
        var results,
          expected = ['2.1', '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.2', '2.3', '2.4', '2.5'];
        results = this.styleguideWordPhrases.section(/gamma - .*/).map(function(section) {
          return section.data.autoincrement;
        });
        results.should.eql(expected);
        done();
      });
    });
  });
});
