// API/src/Utils/Docker/NS.ts
import Docker from 'dockerode';

/**
 * Restarts the BIND Container with the requested name
 * @param containerName BIND Container name
 * @example restartBIND('NS1')
 */
export const restartBIND = async (containerName: string): Promise<boolean> => {
  const docker = new Docker({
    socketPath: '/var/run/docker.sock',
    version: 'v1.39'
  });
  const opts = {
    filters: `{"label": ["com.docker.compose.service=${containerName}"]}`
  };
  const conts = await docker.listContainers(opts);
  const cont = conts.find(a => a.Image === 'resystit/bind9:latest') as Docker.ContainerInfo;
  await docker.getContainer(cont.Id).restart();
  return true;
};
