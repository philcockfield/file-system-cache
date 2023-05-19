import { expect, FileSystemCache, basePath } from './common';

function sleep(seconds: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
} 

describe('expires', async function () {
  this.timeout(3000);
  it('cache doesnt expire (various types)', (done) => {
    const cache1 = new FileSystemCache({ basePath, ttl: 10 });
    const cache2 = new FileSystemCache({ basePath, ttl: 10 });
    
    cache1.set('foo-1', 'bar-1');
    cache1.set('foo-2', 'bar-2', 0);
    cache1.set('foo-3', 'bar-3', 10)
      .then(() => {
        cache2.get('foo')
          .then((result) => { 
            sleep(1).then(() => { 
              expect(result).to.equal('bar') 
            })
          })
          .then(() => {
            cache2.get('foo-2').then((result) => expect(result).to.equal('bar-2'));
            cache2.get('foo-3').then((result) => expect(result).to.equal('bar-3'));
          })
          .finally(() => done());
      });

  });

  it('cache expires (various types)', (done) => {
    const cache1 = new FileSystemCache({ basePath, ttl: 1 });
    const cache2 = new FileSystemCache({ basePath, ttl: 1 });
    cache1.set('number', 123)
    cache1.set('object', { foo: 456 }, 1).then(() => {
      sleep(2).then(() => {
        cache2.get('number')
          .then((result) => expect(result).to.equal(undefined))
        cache2.get('object')
          .then((result) => expect(result).to.equal(undefined))
          .finally(() => done())
          .catch((err) => console.error(err));;
      });
    });
  });


});
