import * as TypeMoq from "typemoq";
import { CtorWithArgs } from "typemoq/Common/Ctor";

class MockBuilder<T> {
  private mock: TypeMoq.IMock<T>;

  constructor(targetConstructor?: CtorWithArgs<T>) {
    if (targetConstructor) {
      this.mock = TypeMoq.Mock.ofType(targetConstructor);
    } else {
      this.mock = TypeMoq.Mock.ofType<T>();
    }
  }

  public with<TResult>(
    selector: (x: T) => TResult,
    value: TResult | ((mock: TypeMoq.IMock<T>) => TResult)
  ): MockBuilder<T> {
    let expression: () => TResult;
    if (typeof value === "function") {
      expression = () =>
        (value as ((mock: TypeMoq.IMock<T>) => TResult))(this.mock);
    } else {
      expression = () => value as TResult;
    }

    this.mock.setup(selector).returns(expression);
    return this;
  }

  public build(): TypeMoq.IMock<T> {
    return this.mock;
  }
}

export { MockBuilder };
