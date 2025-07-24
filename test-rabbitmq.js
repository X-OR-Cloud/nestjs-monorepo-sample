#!/usr/bin/env node

const amqp = require('amqplib');

async function testRabbitMQ() {
  console.log('🐰 Testing RabbitMQ Connection...\n');

  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://test:test@103.252.73.68:5672');
    const channel = await connection.createChannel();

    console.log('✅ Connected to RabbitMQ successfully!\n');

    // Declare exchange and queue
    const exchange = 'cross_service_exchange';
    const queue = 'test_queue';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, 'user.*');

    console.log('📡 Exchange and queue configured\n');

    // Set up consumer
    let messageCount = 0;
    await channel.consume(queue, (msg) => {
      if (msg) {
        const event = JSON.parse(msg.content.toString());
        messageCount++;
        console.log(`📨 [${messageCount}] Received: ${event.eventType} from ${event.source}`);
        console.log(`   User: ${event.data.username}`);
        console.log(`   Correlation: ${event.correlationId}\n`);
        
        // Acknowledge message
        channel.ack(msg);
      }
    });

    // Send test messages
    console.log('📤 Sending test messages...\n');

    const testEvents = [
      {
        eventType: 'user.registered',
        source: 'iam',
        data: {
          userId: 'user_001',
          username: 'john_doe',
          email: 'john@example.com'
        },
        timestamp: new Date(),
        correlationId: 'rabbitmq_test_001'
      },
      {
        eventType: 'user.registered',
        source: 'iam',
        data: {
          userId: 'user_002',
          username: 'jane_smith',
          email: 'jane@example.com'
        },
        timestamp: new Date(),
        correlationId: 'rabbitmq_test_002'
      }
    ];

    for (const event of testEvents) {
      await channel.publish(
        exchange,
        'user.registered',
        Buffer.from(JSON.stringify(event)),
        { persistent: true }
      );
      console.log(`✅ Published: ${event.eventType} for ${event.data.username}`);
    }

    // Wait for messages to be processed
    console.log('\n⏳ Waiting for message processing...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check queue stats
    const queueInfo = await channel.checkQueue(queue);
    console.log('📊 Queue Statistics:');
    console.log(`   - Messages in queue: ${queueInfo.messageCount}`);
    console.log(`   - Consumers: ${queueInfo.consumerCount}`);

    // Cleanup
    await channel.close();
    await connection.close();

    console.log('\n✅ RabbitMQ test completed successfully!');
    console.log('\n💡 RabbitMQ Features Demonstrated:');
    console.log('   ✓ Connection and channel management');
    console.log('   ✓ Exchange and queue declaration');
    console.log('   ✓ Message publishing with routing keys');
    console.log('   ✓ Message consumption with acknowledgments');
    console.log('   ✓ Durable queues for message persistence');
    console.log('   ✓ Topic exchange for flexible routing');

  } catch (error) {
    console.error('❌ RabbitMQ test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure RabbitMQ server is running:');
      console.log('   - Docker: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management');
      console.log('   - Local: brew install rabbitmq && brew services start rabbitmq');
      console.log('   - Windows: Download from https://www.rabbitmq.com/download.html');
      console.log('   - Docker Compose: docker-compose up rabbitmq');
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testRabbitMQ();
}

module.exports = { testRabbitMQ };
