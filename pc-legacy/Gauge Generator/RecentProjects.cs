using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Gauge_Generator
{
    [Serializable()]
    public class RecentProjects
    {
        const int MAX_ITEMS = 4;

        List<string> items = new List<string>();

        private void CropList()
        {
            if (items.Count > MAX_ITEMS) items.RemoveRange(MAX_ITEMS, items.Count - MAX_ITEMS);
        }

        public void DeleteItem(int index)
        {
            items.RemoveAt(index);
        }

        public void AddItem(string path)
        {
            if(path != "")
            {
                if (items.Contains(path)) items.Remove(path);
                items.Insert(0, path);
                CropList();
            }
        }

        public List<string> GetItems()
        {
            return items;
        }
    }
}
