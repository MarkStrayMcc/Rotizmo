import { TestBed, async, inject } from "@angular/core/testing";
import { XHRBackend, RequestMethod, ResponseOptions, Response } from "@angular/http";
import { MockBackend, MockConnection } from "@angular/http/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { mockLossPayeeApiResponse } from "@app/policy/mta/popups/loss-payee/mta-loss-payee.component.mock";
import { PolicyLossPayeeService } from "@app/policy/services/policy-loss-payee.service";
import { LossPayee } from "@app/models/auto-generated/LossPayee";
import { UserService } from "@app/services/user.service";

describe("PolicyLossPayeeService", () => {
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: XHRBackend,
					useClass: MockBackend,
				},
				PolicyLossPayeeService,
				{
					provide: UserService,
					useValue: { isFeatureAccessible: () => true },
				},
			],
			imports: [HttpClientTestingModule],
		});
	}));

	it("Should be created", inject([XHRBackend, PolicyLossPayeeService], (policyLossPayeeService: PolicyLossPayeeService) => {
		expect(policyLossPayeeService).toBeTruthy();
	}));

	it("Should call HTTP GET once to get policy loss payees", inject(
		[XHRBackend, PolicyLossPayeeService],
		(mockBackend: MockBackend, policyLossPayeeService: PolicyLossPayeeService) => {
			// Actors
			let connectionCount = 0;
			const policyNumber = "TestPolicy";
			const lossPayees = [mockLossPayeeApiResponse];

			mockBackend.connections.subscribe((connection: MockConnection) => {
				// Asserts
				expect(connection.request.method).toBe(RequestMethod.Get);
				expect(connection.request.url).toBe(`/api/policy/${policyNumber}/loss-payee`);

				connectionCount++;

				connection.mockRespond(
					new Response(
						new ResponseOptions({
							body: JSON.stringify(lossPayees),
							status: 200,
						})
					)
				);
			});

			// Actions
			policyLossPayeeService.getLossPayees(policyNumber).subscribe((lossPayees: LossPayee[]) => {
				// Asserts
				expect(lossPayees).toBeDefined();
				expect(lossPayees.length).toBe(1);
				expect(connectionCount).toBe(1);
			});
		}
	));

	it("Should map response to LossPayees", inject(
		[XHRBackend, PolicyLossPayeeService],
		(mockBackend: MockBackend, policyLossPayeeService: PolicyLossPayeeService) => {
			// Actors
			const policyNumber = "TestPolicy";
			const lossPayees = [mockLossPayeeApiResponse];

			mockBackend.connections.subscribe((connection: MockConnection) => {
				connection.mockRespond(
					new Response(
						new ResponseOptions({
							body: JSON.stringify(lossPayees),
							status: 200,
						})
					)
				);
			});

			// Actions
			policyLossPayeeService.getLossPayees(policyNumber).subscribe((lossPayees: LossPayee[]) => {
				// Asserts
				expect(lossPayees).toBeDefined();
				expect(lossPayees.length).toBe(1);
				expect(lossPayees[0].entityName).toBe(mockLossPayeeApiResponse.EntityName);
			});
		}
	));
});
