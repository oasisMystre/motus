import type { Logger } from "pino";
import z, { type ZodObject } from "zod";
import {
  Agent,
  run,
  type MCPServerStreamableHttp,
  type OutputGuardrail,
} from "@openai/agents";

const MessageOutput = z.object({ response: z.string() });

export class MotusMcpClient {
  connected: boolean;

  constructor(
    private readonly server: MCPServerStreamableHttp,
    private readonly config: { name: string },
    private readonly logger?: Logger,
  ) {
    this.connected = false;
  }

  async connect() {
    await this.server.connect();

    if (this.connected) return this;

    this.connected = true;

    return this;
  }

  async close() {
    if (this.connected) {
      await this.server.close();
      this.connected = false;
    }
  }

  async createAgent<T extends z.ZodObject>(
    params: Omit<
      ConstructorParameters<typeof Agent>[number],
      "name" | "mcpServers"
    >,
    outputType?: T,
  ) {
    await this.connect();
    if (outputType) {
      const outputGuardrail = this.createGuardRail(outputType);
      if (params.outputGuardrails)
        params.outputGuardrails.push(outputGuardrail);
      else params.outputGuardrails = [outputGuardrail];

      params.outputType = MessageOutput;
    }
    const agent = new Agent({
      ...params,
      name: this.config.name,
      mcpServers: [this.server],
    });

    return agent;
  }

  private createGuardRail<T extends z.ZodObject>(
    schema: T,
  ): OutputGuardrail<typeof MessageOutput> {
    const guardRailAgent = new Agent({
      name: "Motus Guardrail check",
      instructions: "Check if the output schama is valid.",
      outputType: schema,
    });

    return {
      name: "Motus Output Guardrail",
      async execute({ agentOutput, context }) {
        const result = await run(guardRailAgent, agentOutput.response, {
          context,
        });

        return {
          outputInfo: result.finalOutput,
          tripwireTriggered: !schema.safeParse(result.finalOutput).success,
        };
      },
    };
  }

  static safeOutputType<
    T extends ZodObject,
    R = T extends undefined ? unknown : z.infer<T>,
  >(
    finalOutput: unknown,
    outputType: T,
    passThrough: (value: unknown) => R,
  ): R {
    const result = outputType.safeParse(finalOutput);
    if (result.data) return result.data as R;

    return passThrough?.(finalOutput);
  }
}
