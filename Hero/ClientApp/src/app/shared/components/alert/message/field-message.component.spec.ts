import { SharedModule } from "@app/shared/shared.module";
import { Shallow } from "shallow-render";
import { FieldMessageComponent } from "./field-message.component";

describe("FieldMessageComponent", () => {
    let component: FieldMessageComponent;

    beforeEach(async () => {
        const { instance } = await new Shallow(FieldMessageComponent, SharedModule).render();
        component = instance;
    });

    it("should create component", () => {
        expect(component).toBeDefined();
    });
});
